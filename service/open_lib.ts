import axios from "./../config/axios";
import {
  WorksBySubjectResponse,
  WorkDetailsResponse,
  AuthorDetailsResponse,
  SearchWorksResponse,
} from "@/types/open_library";
import { CAROUSEL_CONFIG } from "@/data/carousel_items";

const getWorksBySubject = async (
  subject: string,
  limit: number = CAROUSEL_CONFIG.DEFAULT_BOOKS_LIMIT,
  offset: number = CAROUSEL_CONFIG.DEFAULT_OFFSET,
): Promise<WorksBySubjectResponse> => {
  try {
    const response = await axios.get(
      `/subjects/${subject}.json?limit=${limit}&offset=${offset}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getWorkDetails = async (
  type: string,
  workKey: string,
): Promise<WorkDetailsResponse> => {
  try {
    const response = await axios.get(`/${type}/${workKey}.json`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getAuthorDetails = async (
  authorKey: string,
): Promise<AuthorDetailsResponse> => {
  try {
    const response = await axios.get(`${authorKey}.json`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const searchWorks = async (
  query: string,
  limit = 10,
  offset = 0,
): Promise<SearchWorksResponse> => {
  try {
    const response = await axios.get(
      `/search.json?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { getWorksBySubject, getWorkDetails, getAuthorDetails, searchWorks };
