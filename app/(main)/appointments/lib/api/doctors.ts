import api from 'lib/api/client'

export type DoctorSuggestion = {
  id: string
  name: string
  specialty?: string
}

export async function searchDoctors(query: string): Promise<DoctorSuggestion[]> {
  if (!query.trim()) return []

  const { data } = await api.get<DoctorSuggestion[]>('/doctors', {
    params: { search: query },
  })

  return data
}