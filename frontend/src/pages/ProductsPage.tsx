import { Plus } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useProducts } from '../hooks/useProducts';

export default function ProductsPage() {
  const { data: products = [], isLoading, isError } = useProducts();

  const ProductCard = ({ product }: { product: typeof products[number] }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-slate-900">{product.name}</h3>
            <p className="text-sm text-slate-500">SKU: {product.sku}</p>
          </div>

          {product.description && (
            <p className="text-sm text-slate-600 line-clamp-2">{product.description}</p>
          )}

          <div className="pt-3 border-t border-slate-200">
            <p className="text-lg font-bold text-slate-900">
              ${parseFloat(product.price).toFixed(2)}
            </p>
          </div>

          <div className="text-xs text-slate-500">
            Added {new Date(product.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Products</h2>
            <p className="text-slate-600">Manage your product catalog</p>
          </div>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <Card>
            <CardContent className="pt-6 text-center text-slate-500">
              Loading products...
            </CardContent>
          </Card>
        ) : isError ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 text-center text-red-600">
              Error loading products
            </CardContent>
          </Card>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-slate-500">
              <p>No products in the catalog yet.</p>
              <p className="text-sm">Products will appear here once they are added to the system.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Stats */}
        {products.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-slate-900">{products.length}</p>
                  <p className="mt-2 text-sm text-slate-600">Total Products</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-slate-900">
                    ${products.reduce((sum, p) => sum + parseFloat(p.price || '0'), 0).toFixed(2)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">Total Value</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-slate-900">
                    ${(products.reduce((sum, p) => sum + parseFloat(p.price || '0'), 0) / products.length).toFixed(2)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">Average Price</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
