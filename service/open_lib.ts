import axios from "./../config/axios";
import { WorksBySubjectResponse } from "@/types/open_library";
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

export { getWorksBySubject };
