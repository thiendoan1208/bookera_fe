import axios from "./../config/axios";
import {
  WorksBySubjectResponse,
  WorkDetailsResponse,
  AuthorDetailsResponse,
} from "@/types/open_library";
import { CAROUSEL_CONFIG } from "@/data/carousel_items";

const getWorksBySubject = async (
  subject: string,
  limit = CAROUSEL_CONFIG.DEFAULT_BOOKS_LIMIT,
  offset = CAROUSEL_CONFIG.DEFAULT_OFFSET,
): Promise<WorksBySubjectResponse> => {
  try {
    const response = await axios.get(
      `/subjects/${subject}.json?limit=${limit}&offset=${offset}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching works by subject:", error);
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
    console.error("Error fetching work details:", error);
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
    console.error("Error fetching author details:", error);
    throw error;
  }
};

export { getWorksBySubject, getWorkDetails, getAuthorDetails };
