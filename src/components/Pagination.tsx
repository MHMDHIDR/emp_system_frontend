import React from 'react'

interface Props {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const Pagination: React.FC<Props> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  return !totalPages || totalPages === 1 ? null : (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginBlock: '10px'
      }}
    >
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        الصفحة التالية
      </button>
      &nbsp;
      <span>
        الصفحة {currentPage} من {totalPages}
      </span>
      &nbsp;
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        الصفحة السابقة
      </button>
    </div>
  )
}
