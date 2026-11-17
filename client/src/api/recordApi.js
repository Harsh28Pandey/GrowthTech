import api from './axios';

export const recordApi = {
  getRecords: async (params = {}) => {
    const response = await api.get('/records', { params });
    return response.data;
  },

  getRecordById: async (id) => {
    const response = await api.get(`/records/${id}`);
    return response.data;
  },

  createRecord: async (recordData) => {
    const response = await api.post('/records', recordData);
    return response.data;
  },

  updateRecord: async (id, recordData) => {
    const response = await api.put(`/records/${id}`, recordData);
    return response.data;
  },

  deleteRecord: async (id) => {
    const response = await api.delete(`/records/${id}`);
    return response.data;
  },
};

