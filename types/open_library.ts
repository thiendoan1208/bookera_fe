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

export interface TypeLink {
  key: string;
}

export interface DateTime {
  type: string;
  value: string;
}

export interface LinkDetail {
  title: string;
  url: string;
  type: TypeLink;
}

export interface FirstSentence {
  type: string;
  value: string;
}

export interface AuthorDetail {
  author: {
    key: string;
  };
  type: TypeLink;
}

export interface Excerpt {
  excerpt: string;
  comment: string;
  author: {
    key: string;
  };
}

export interface Identifiers {
  wikidata?: string[];
  goodreads?: string[];
  isfdb?: string[];
  librarything?: string[];
  musicbrainz?: string[];
  bookbrainz?: string[];
  [key: string]: string[] | undefined;
}

export interface WorkDetailsResponse {
  description?: string;
  title: string;
  key: string;
  authors: AuthorDetail[];
  type: TypeLink;
  covers?: number[];
  first_sentence?: FirstSentence;
  first_publish_date?: string;
  links?: LinkDetail[];
  subject_places?: string[];
  subjects?: string[];
  subject_people?: string[];
  subject_times?: string[];
  excerpts?: Excerpt[];
  identifiers?: Identifiers;
  latest_revision?: number;
  revision?: number;
  created?: DateTime;
  last_modified?: DateTime;
  [key: string]: unknown;
}

export interface AuthorDetailsResponse {
  name: string;
  key: string;
  type: TypeLink;
  birth_date?: string;
  death_date?: string;
  fuller_name?: string;
  personal_name?: string;
  title?: string;
  bio?: string | { type: string; value: string };
  alternate_names?: string[];
  photos?: number[];
  links?: LinkDetail[];
  website?: string;
  entity_type?: string;
  source_records?: string[];
  remote_ids?: {
    viaf?: string;
    goodreads?: string;
    storygraph?: string;
    isni?: string;
    librarything?: string;
    amazon?: string;
    wikidata?: string;
    imdb?: string;
    musicbrainz?: string;
    lc_naf?: string;
    opac_sbn?: string;
    [key: string]: string | undefined;
  };
  latest_revision?: number;
  revision?: number;
  created?: DateTime;
  last_modified?: DateTime;
  [key: string]: unknown;
}

export interface SearchResultDoc {
  author_key?: string[];
  author_name?: string[];
  cover_edition_key?: string;
  cover_i?: number;
  ebook_access?: string;
  edition_count?: number;
  first_publish_year?: number;
  has_fulltext?: boolean;
  ia?: string[];
  ia_collection?: string[];
  key: string;
  language?: string[];
  lending_edition_s?: string;
  lending_identifier_s?: string;
  public_scan_b?: boolean;
  title: string;
  [key: string]: unknown;
}

export interface SearchWorksResponse {
  numFound: number;
  start: number;
  numFoundExact: boolean;
  num_found: number;
  documentation_url: string;
  q: string;
  offset: null | number;
  docs: SearchResultDoc[];
}
