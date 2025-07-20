export interface PaginationControlProps {
  page: number;
  totalPage: number;
  onPageChange: (page: number) => void;
}