export interface Book {
  book_id: number
  title: string
  description?: string
  author_id: number
  author_name?: string
  photo?: string
}

export interface Author {
  author_id: number
  name_author: string
  photo?: string
  biography?: string
}

export interface User {
  id: number
  username: string
  role: string
  profile_image?: string
  description?: string
}

export interface Loan {
  loans_id: number
  loan_date: string
  book_id: number
  title: string
  photo?: string
  description?: string
}

export interface Review {
  review_id: number
  book_id: number
  user_id: number
  rating: number
  comment: string
  username: string
  review_date: string
}
