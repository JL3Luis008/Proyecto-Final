import { useParams } from "react-router-dom";
import ProductDetailsComponent from "../components/organisms/ProductDetails/ProductDetails";

export default function ProductDetails() {
  const { productId } = useParams();
  const isValidId = /^[a-f\d]{24}$/i.test(productId);
  if (!isValidId) {
    return (
      <div className="search-results-message">ID de producto inválido.</div>
    );
  }
  return <ProductDetailsComponent productId={productId} />;
}
