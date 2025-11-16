import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest, endpoints } from '@/lib/api-client';
import type { CreateFieldPayload, Field, FieldAnalysis, Insight, StartAnalysisPayload } from '@/types';

export const fieldsKeys = {
  all: ['fields'] as const,
  detail: (fieldId: string) => [...fieldsKeys.all, fieldId] as const,
  insights: (fieldId: string) => [...fieldsKeys.all, fieldId, 'insights'] as const,
  analyses: (fieldId: string) => [...fieldsKeys.all, fieldId, 'analyses'] as const,
};

export const useFields = () =>
  useQuery({
    queryKey: fieldsKeys.all,
    queryFn: () => apiRequest<Field[]>({ url: endpoints.fields }),
  });

export const useField = (fieldId?: string) =>
  useQuery({
    queryKey: fieldId ? fieldsKeys.detail(fieldId) : fieldsKeys.all,
    queryFn: () => apiRequest<Field>({ url: `${endpoints.fields}/${fieldId}` }),
    enabled: Boolean(fieldId),
  });

export const useFieldAnalyses = (fieldId?: string) =>
  useQuery({
    queryKey: fieldId ? fieldsKeys.analyses(fieldId) : fieldsKeys.all,
    queryFn: () => apiRequest<FieldAnalysis[]>({ url: `${endpoints.analyses}?fieldId=${fieldId}` }),
    enabled: Boolean(fieldId),
  });

export const useFieldInsights = (fieldId?: string) =>
  useQuery({
    queryKey: fieldId ? fieldsKeys.insights(fieldId) : fieldsKeys.all,
    queryFn: () => apiRequest<Insight[]>({ url: `${endpoints.insights}?fieldId=${fieldId}` }),
    enabled: Boolean(fieldId),
  });

export const useCreateField = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFieldPayload) =>
      apiRequest<Field>({ url: endpoints.fields, method: 'POST', data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fieldsKeys.all });
    },
  });
};

export const useStartAnalysis = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StartAnalysisPayload) =>
      apiRequest<FieldAnalysis>({ url: endpoints.analyses, method: 'POST', data: payload }),
    onSuccess: (_analysis, payload) => {
      if (payload.fieldId) {
        queryClient.invalidateQueries({ queryKey: fieldsKeys.analyses(payload.fieldId) });
        queryClient.invalidateQueries({ queryKey: fieldsKeys.detail(payload.fieldId) });
      }
    },
  });
};
