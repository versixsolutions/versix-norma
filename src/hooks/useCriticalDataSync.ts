// src/hooks/useCriticalDataSync.ts

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { saveCriticalData } from '@/lib/offline-db';
import { supabase } from '@/lib/supabase'; // Assumindo que existe um lib/supabase

export function useCriticalDataSync(condominioId: string) {
  // Buscar e sincronizar dados críticos
  const { data } = useQuery({
    queryKey: ['critical-data', condominioId],
    queryFn: async () => {
      // Telefones de emergência
      const { data: telefones } = await supabase
        .from('telefones_emergencia')
        .select('*')
        .eq('condominio_id', condominioId);
      
      // Moradores vulneráveis
      const { data: vulneraveis } = await supabase
        .from('moradores_vulneraveis')
        .select(`
          *,
          usuario:usuarios(nome, telefone),
          unidade:unidades_habitacionais(identificador, bloco)
        `)
        .eq('condominio_id', condominioId)
        .eq('ativo', true);
      
      // Mapas de evacuação
      const { data: mapas } = await supabase
        .from('documentos')
        .select('*')
        .eq('condominio_id', condominioId)
        .eq('categoria', 'mapa_evacuacao');
      
      // Contatos do síndico e portaria
      const { data: contatos } = await supabase
        .from('usuarios')
        .select('id, nome, telefone, role')
        .eq('condominio_id', condominioId)
        .in('role', ['sindico', 'subsindico', 'porteiro', 'zelador']);
      
      return { telefones, vulneraveis, mapas, contatos };
    },
    staleTime: 1000 * 60 * 60, // 1 hora
    refetchOnWindowFocus: false
  });
  
  // Salvar no IndexedDB quando os dados mudarem
  useEffect(() => {
    if (data) {
      saveCriticalData('emergency-phones', data.telefones);
      saveCriticalData('vulnerable-residents', data.vulneraveis);
      saveCriticalData('evacuation-maps', data.mapas);
      saveCriticalData('emergency-contacts', data.contatos);
    }
  }, [data]);
  
  return data;
}
