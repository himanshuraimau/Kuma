import { apiClient } from './client';

export interface AnalyzeImageResponse {
    success: boolean;
    analysis: string;
    metadata?: Record<string, any>;
}

export interface ExtractTextResponse {
    success: boolean;
    text: string;
}

export interface DescribeImageResponse {
    success: boolean;
    description: string;
}

/**
 * Upload and analyze image
 */
export const analyzeImage = async (file: File, prompt: string): Promise<AnalyzeImageResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('prompt', prompt);

    const response = await apiClient.post('/upload/analyze', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Upload and extract text (OCR)
 */
export const extractText = async (file: File): Promise<ExtractTextResponse> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post('/upload/extract-text', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Upload and describe image
 */
export const describeImage = async (file: File): Promise<DescribeImageResponse> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post('/upload/describe', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
