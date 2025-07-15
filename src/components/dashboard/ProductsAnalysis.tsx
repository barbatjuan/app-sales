
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import TopSellingProducts from "./TopSellingProducts";
import LeastSellingProducts from "./LeastSellingProducts";

const ProductsAnalysis = () => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Productos más/menos vendidos</CardTitle>
        <CardDescription>Análisis de rendimiento de productos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
          <div className="flex-1 border rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2">Productos más vendidos</h3>
            <TopSellingProducts />
          </div>
          <div className="flex-1 border rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2">Productos menos vendidos</h3>
            <LeastSellingProducts />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductsAnalysis;
