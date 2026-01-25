export interface Author {
  name: string;
  key: string;
}

export interface Work {
  key: string;
  title: string;
  edition_count: number;
  authors: Author[];
  has_fulltext: boolean;
  cover_id?: number;
  cover_edition_key?: string;
  first_publish_year?: number;
  subject?: string[];
  ia_collection?: string[];
  lendinglibrary?: boolean;
  printdisabled?: boolean;
  lendable?: boolean;
  ia?: string;
  [key: string]: unknown; // For other optional fields
}

export interface WorksBySubjectResponse {
  key: string;
  name: string;
  subject_type: string;
  work_count: number;
  works: Work[];
}
