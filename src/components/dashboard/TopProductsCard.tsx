import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import TopSellingProducts from "./TopSellingProducts";

const TopProductsCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Productos más vendidos</CardTitle>
        <CardDescription>Análisis de rendimiento de productos</CardDescription>
      </CardHeader>
      <CardContent>
        <TopSellingProducts />
      </CardContent>
    </Card>
  );
};

export default TopProductsCard;
