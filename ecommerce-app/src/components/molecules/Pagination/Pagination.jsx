import { Button, Icon } from "../../atoms";
import "./Pagination.css";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <div className="pagination">
            <Button
                variant="secondary"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn arrow-btn"
            >
                <Icon name="chevronLeft" size={16} />
            </Button>

            <div className="pagination-pages">
                {pages.map((page) => (
                    <Button
                        key={page}
                        variant={currentPage === page ? "primary" : "secondary"}
                        onClick={() => onPageChange(page)}
                        className={`pagination-btn page-number ${currentPage === page ? "active" : ""}`}
                    >
                        {page}
                    </Button>
                ))}
            </div>

            <Button
                variant="secondary"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn arrow-btn"
            >
                <Icon name="chevronRight" size={16} />
            </Button>
        </div>
    );
};

export default Pagination;
