import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { PaginationControlProps } from "@/types/pagination.types";



export const PaginationControl: React.FC<PaginationControlProps> = ({
  page,
  totalPage,
  onPageChange,
}) => {
  return (
    <div className="flex justify-end mt-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={page > 1 ? "#" : undefined}
              onClick={(e) => {
                e.preventDefault();
                if (page > 1) onPageChange(page - 1);
              }}
            />
          </PaginationItem>

          {Array.from({ length: totalPage }).map((_, idx) => (
            <PaginationItem key={idx}>
              <PaginationLink
                href="#"
                isActive={page === idx + 1}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(idx + 1);
                }}
              >
                {idx + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              href={page < totalPage ? "#" : undefined}
              onClick={(e) => {
                e.preventDefault();
                if (page < totalPage) onPageChange(page + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
