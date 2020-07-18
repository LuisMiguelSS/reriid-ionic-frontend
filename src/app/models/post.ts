
export interface Post {

    id: number;
    user_id: number;
    description?: string;
    reserved?: number;
    views?: number;
    images?: string[];
    book_title: string;
    book_subtitle?: string;
    book_synopsis?: string;
    book_isbn?: number;
    book_author?: string;
    book_price?: number;
    deleted_at?: string;
    created_at?: string;
    updated_at?: string;

}
