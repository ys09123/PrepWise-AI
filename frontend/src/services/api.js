import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = {
  async _handleResponse(response) {
    // Handle 204 No Content
    if (response.status === 204) {
      return { success: true };
    }

    // Parse JSON
    const data = await response.json().catch(() => null);

    // Handle Errors 
    if (!response.ok) {
      throw new Error(data?.error || data?.message || `Request failed: ${response.statusText}`);
    }

    return data;
  },

  async getToken() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session?.access_token) {
      throw new Error('User is not authenticated');
    }
    
    return session.access_token;
  },

  async uploadResume(file) {
    const token = await this.getToken();
    const formData = new FormData();
    formData.append('resume', file);

    const response = await fetch(`${API_URL}/resumes/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    return this._handleResponse(response);
  },

  async getResumes() {
    const token = await this.getToken();
    
    console.log('Fetching resumes from:', `${API_URL}/resumes`);
    
    const response = await fetch(`${API_URL}/resumes`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await this._handleResponse(response);
    console.log('Resumes response:', data);
    
    return data;
  },

  async getResume(id) {
    if (!id) throw new Error('Resume ID is required'); 

    const token = await this.getToken();
    
    const response = await fetch(`${API_URL}/resumes/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return this._handleResponse(response);
  },

  async deleteResume(id) {
    if (!id) throw new Error('Resume ID is required');

    const token = await this.getToken();
    
    const response = await fetch(`${API_URL}/resumes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return this._handleResponse(response);
  }
};