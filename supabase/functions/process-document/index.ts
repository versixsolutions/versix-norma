import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

interface ProcessDocumentRequest {
  documentId: string;
  condominioId: string;
  userId: string;
}

interface DocumentChunk {
  document_id: string;
  document_type: string;
  document_name: string;
  page_number: number;
  chunk_index: number;
  content: string;
}

// Simple PDF text extraction (basic implementation)
// In production, you'd want to use a more robust PDF parsing library
async function extractTextFromPDF(fileUrl: string): Promise<string> {
  try {
    // For now, we'll use a simple approach
    // In production, integrate with pdf-parse or similar
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch PDF');
    }

    // This is a placeholder - real PDF extraction would require pdf.js or similar
    // For demo purposes, we'll return mock content
    return `Conteúdo extraído do documento PDF. Este é um placeholder para demonstração.
    Em produção, seria implementada extração real de texto usando bibliotecas como pdf-parse ou pdf2pic.

    Artigo 1º - O condomínio é uma comunhão de frações ideais do terreno e das edificações.
    Artigo 2º - Cada fração ideal confere ao seu proprietário o direito de uso exclusivo das unidades.

    Capítulo II - Da Administração
    Artigo 10º - A administração do condomínio compete ao síndico, que poderá ser pessoa física ou jurídica.
    Artigo 11º - O síndico será eleito em assembleia geral ordinária, por maioria absoluta dos votos.

    Capítulo III - Das Cotas
    Artigo 20º - As despesas do condomínio serão rateadas proporcionalmente às frações ideais.
    Artigo 21º - As cotas condominiais deverão ser pagas até o dia 10 de cada mês.`;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;

    // Try to break at sentence boundaries
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end);
      const lastNewline = text.lastIndexOf('\n', end);

      if (lastPeriod > start && lastPeriod > lastNewline) {
        end = lastPeriod + 1;
      } else if (lastNewline > start) {
        end = lastNewline + 1;
      }
    }

    chunks.push(text.slice(start, end).trim());
    start = end - overlap;

    if (start >= text.length) break;
  }

  return chunks;
}

async function generateEmbedding(text: string): Promise<number[]> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-3-small',
      encoding_format: 'float',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to generate embedding: ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

export async function handler(req: Request): Promise<Response> {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { documentId, condominioId, userId }: ProcessDocumentRequest = await req.json();

    if (!documentId || !condominioId || !userId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get document information
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('condominio_id', condominioId)
      .single();

    if (docError || !document) {
      return new Response(JSON.stringify({ error: 'Document not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update document status to processing
    await supabase
      .from('documents')
      .update({ status: 'processing' })
      .eq('id', documentId);

    try {
      // Extract text from PDF
      const extractedText = await extractTextFromPDF(document.file_url || document.file_path!);

      // Chunk the text
      const textChunks = chunkText(extractedText);

      // Process each chunk
      const chunksToInsert: Array<{
        condominio_id: string;
        document_id: string;
        document_type: string;
        document_name: string;
        chunk_index: number;
        content: string;
        embedding: number[];
      }> = [];

      for (let i = 0; i < textChunks.length; i++) {
        const chunk = textChunks[i];

        // Skip very short chunks
        if (chunk.length < 50) continue;

        try {
          const embedding = await generateEmbedding(chunk);

          chunksToInsert.push({
            condominio_id: condominioId,
            document_id: documentId,
            document_type: document.type,
            document_name: document.name,
            chunk_index: i,
            content: chunk,
            embedding,
          });
        } catch (embeddingError) {
          console.error(`Failed to generate embedding for chunk ${i}:`, embeddingError);
          // Continue with other chunks
        }
      }

      // Insert chunks in batches
      const batchSize = 10;
      for (let i = 0; i < chunksToInsert.length; i += batchSize) {
        const batch = chunksToInsert.slice(i, i + batchSize);

        const { error: insertError } = await supabase
          .from('document_chunks')
          .insert(batch);

        if (insertError) {
          console.error('Error inserting chunk batch:', insertError);
          throw insertError;
        }
      }

      // Update document status to completed
      await supabase
        .from('documents')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', documentId);

      return new Response(JSON.stringify({
        success: true,
        chunksProcessed: chunksToInsert.length,
        message: `Document processed successfully. ${chunksToInsert.length} chunks created.`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (processingError) {
      console.error('Error processing document:', processingError);

      // Update document status to failed
      await supabase
        .from('documents')
        .update({ status: 'failed' })
        .eq('id', documentId);

      return new Response(JSON.stringify({
        error: 'Failed to process document',
        details: processingError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in process-document function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
