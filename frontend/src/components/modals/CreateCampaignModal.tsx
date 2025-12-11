import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import InfluencerMultiSelect from '../InfluencerMultiSelect';
import {
  useCreateCampaign,
  useUpdateCampaign,
  useAssignCampaignInfluencer,
  useLinkCampaignProduct,
} from '../../hooks/useCampaigns';
import { useInfluencers } from '../../hooks/useInfluencers';
import { useProducts } from '../../hooks/useProducts';
import { Campaign, Product } from '../../types/models';

const campaignDetailsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  type: z.enum(['REELS', 'POSTS', 'STORIES', 'MIXED']).optional(),
  status: z.string().optional(),
  budget: z.coerce.number().positive().optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  brief: z.string().optional().nullable(),
});

const deliverablesSchema = z.object({
  reelsRequired: z.coerce.number().min(0).optional(),
  postsRequired: z.coerce.number().min(0).optional(),
  storiesRequired: z.coerce.number().min(0).optional(),
  deliverableDeadline: z.string().optional().nullable(),
});

type CampaignDetailsData = z.infer<typeof campaignDetailsSchema>;
type DeliverablesData = z.infer<typeof deliverablesSchema>;

interface CreateCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: Campaign;
}

type Step = 'details' | 'deliverables' | 'influencers' | 'products';

export default function CreateCampaignModal({
  open,
  onOpenChange,
  campaign,
}: CreateCampaignModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [selectedInfluencers, setSelectedInfluencers] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<
    Array<{ productId: string; quantity: number }>
  >([]);

  const { mutate: createCampaign, isPending: isCreatePending } =
    useCreateCampaign();
  const { mutate: updateCampaign, isPending: isUpdatePending } =
    useUpdateCampaign();
  const { mutate: assignInfluencer } = useAssignCampaignInfluencer();
  const { mutate: linkProduct } = useLinkCampaignProduct();

  const { data: influencersData } = useInfluencers();
  const { data: productsData } = useProducts();

  const influencers = influencersData || [];
  const products = productsData?.data || [];

  const detailsForm = useForm<CampaignDetailsData>({
    resolver: zodResolver(campaignDetailsSchema),
    defaultValues: campaign
      ? {
          name: campaign.name,
          description: campaign.description || undefined,
          type: campaign.type || undefined,
          status: campaign.status,
          budget: campaign.budget ? parseFloat(campaign.budget) : undefined,
          startDate: campaign.startDate?.split('T')[0],
          endDate: campaign.endDate?.split('T')[0],
          brief: campaign.brief || undefined,
        }
      : {
          status: 'DRAFT',
        },
  });

  const deliverablesForm = useForm<DeliverablesData>({
    resolver: zodResolver(deliverablesSchema),
    defaultValues: campaign
      ? {
          reelsRequired: campaign.reelsRequired || 0,
          postsRequired: campaign.postsRequired || 0,
          storiesRequired: campaign.storiesRequired || 0,
          deliverableDeadline: campaign.deliverableDeadline?.split('T')[0],
        }
      : {},
  });

  const isPending = isCreatePending || isUpdatePending;

  const onDetailsSubmit = (_data: CampaignDetailsData) => {
    setCurrentStep('deliverables');
  };

  const onDeliverablesSubmit = (_data: DeliverablesData) => {
    setCurrentStep('influencers');
  };

  const onInfluencersSubmit = () => {
    setCurrentStep('products');
  };

  const onProductsSubmit = async () => {
    const detailsData = detailsForm.getValues();
    const deliverablesData = deliverablesForm.getValues();

    const campaignData: Partial<Campaign> = {
      name: detailsData.name,
      description: detailsData.description,
      type: detailsData.type,
      status: detailsData.status || 'DRAFT',
      budget: detailsData.budget?.toString(),
      startDate: detailsData.startDate,
      endDate: detailsData.endDate,
      brief: detailsData.brief,
      reelsRequired: deliverablesData.reelsRequired,
      postsRequired: deliverablesData.postsRequired,
      storiesRequired: deliverablesData.storiesRequired,
      deliverableDeadline: deliverablesData.deliverableDeadline,
      storeId: 'default-store',
    };

    if (campaign?.id) {
      updateCampaign({ id: campaign.id, ...campaignData } as Campaign, {
        onSuccess: (updatedCampaign) => {
          assignInfluencers(updatedCampaign.id);
        },
      });
    } else {
      createCampaign(
        campaignData as Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>,
        {
          onSuccess: (newCampaign) => {
            assignInfluencers(newCampaign.id);
          },
        }
      );
    }
  };

  const assignInfluencers = (campaignId: string) => {
    if (selectedInfluencers.length === 0) {
      linkProducts(campaignId);
      return;
    }

    selectedInfluencers.forEach((influencerId) => {
      assignInfluencer(
        {
          campaignId,
          influencerId,
          rate: 0,
          status: 'PENDING',
        },
        {
          onSuccess: () => {
            if (
              selectedInfluencers.indexOf(influencerId) ===
              selectedInfluencers.length - 1
            ) {
              linkProducts(campaignId);
            }
          },
        }
      );
    });
  };

  const linkProducts = (campaignId: string) => {
    if (selectedProducts.length === 0) {
      handleClose();
      return;
    }

    selectedProducts.forEach((item) => {
      linkProduct({
        campaignId,
        productId: item.productId,
        quantity: item.quantity,
      });
    });

    handleClose();
  };

  const handleClose = () => {
    setCurrentStep('details');
    setSelectedInfluencers([]);
    setSelectedProducts([]);
    detailsForm.reset();
    deliverablesForm.reset();
    onOpenChange(false);
  };

  const addProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProducts([...selectedProducts, { productId, quantity: 1 }]);
    }
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(
      selectedProducts.filter((p) => p.productId !== productId)
    );
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    setSelectedProducts(
      selectedProducts.map((p) =>
        p.productId === productId ? { ...p, quantity } : p
      )
    );
  };

  const selectedProductDetails = selectedProducts
    .map((item) => products.find((p) => p.id === item.productId))
    .filter(Boolean) as Product[];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {campaign ? 'Edit Campaign' : 'Create New Campaign'}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'details' && 'Step 1: Campaign Details'}
            {currentStep === 'deliverables' && 'Step 2: Deliverables'}
            {currentStep === 'influencers' && 'Step 3: Assign Influencers'}
            {currentStep === 'products' && 'Step 4: Link Products'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1: Details */}
          {currentStep === 'details' && (
            <form
              onSubmit={detailsForm.handleSubmit(onDetailsSubmit)}
              className="space-y-4"
            >
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter campaign name"
                    {...detailsForm.register('name')}
                  />
                  {detailsForm.formState.errors.name && (
                    <p className="text-sm text-red-500">
                      {detailsForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Enter campaign description"
                    {...detailsForm.register('description')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Campaign Type</Label>
                    <Select
                      value={detailsForm.watch('type') || ''}
                      onValueChange={(value) =>
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        detailsForm.setValue('type', value as any)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REELS">Reels</SelectItem>
                        <SelectItem value="POSTS">Posts</SelectItem>
                        <SelectItem value="STORIES">Stories</SelectItem>
                        <SelectItem value="MIXED">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="budget">Budget</Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      {...detailsForm.register('budget')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      {...detailsForm.register('startDate')}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      {...detailsForm.register('endDate')}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="brief">Brief</Label>
                  <Input
                    id="brief"
                    placeholder="Campaign brief or guidelines"
                    {...detailsForm.register('brief')}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Step 2: Deliverables */}
          {currentStep === 'deliverables' && (
            <form
              onSubmit={deliverablesForm.handleSubmit(onDeliverablesSubmit)}
              className="space-y-4"
            >
              <div className="grid gap-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="reelsRequired">Reels Required</Label>
                    <Input
                      id="reelsRequired"
                      type="number"
                      min="0"
                      {...deliverablesForm.register('reelsRequired')}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="postsRequired">Posts Required</Label>
                    <Input
                      id="postsRequired"
                      type="number"
                      min="0"
                      {...deliverablesForm.register('postsRequired')}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="storiesRequired">Stories Required</Label>
                    <Input
                      id="storiesRequired"
                      type="number"
                      min="0"
                      {...deliverablesForm.register('storiesRequired')}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="deliverableDeadline">
                    Deliverable Deadline
                  </Label>
                  <Input
                    id="deliverableDeadline"
                    type="date"
                    {...deliverablesForm.register('deliverableDeadline')}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep('details')}
                  disabled={isPending}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button type="submit" disabled={isPending}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Step 3: Influencers */}
          {currentStep === 'influencers' && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Select Influencers</Label>
                <InfluencerMultiSelect
                  influencers={influencers}
                  selected={selectedInfluencers}
                  onSelectionChange={setSelectedInfluencers}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep('deliverables')}
                  disabled={isPending}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={onInfluencersSubmit}
                  disabled={isPending}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* Step 4: Products */}
          {currentStep === 'products' && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="product-select">Add Products</Label>
                <div className="flex gap-2">
                  <Select
                    onValueChange={(productId) => {
                      addProduct(productId);
                    }}
                  >
                    <SelectTrigger id="product-select">
                      <SelectValue placeholder="Select a product to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedProductDetails.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Products</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedProductDetails.map((product) => {
                      const item = selectedProducts.find(
                        (p) => p.productId === product.id
                      );
                      return (
                        <div
                          key={product.id}
                          className="flex items-center gap-2 p-2 border border-slate-200 rounded"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-900">
                              {product.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {product.sku}
                            </div>
                          </div>
                          <Input
                            type="number"
                            min="1"
                            value={item?.quantity || 1}
                            onChange={(e) =>
                              updateProductQuantity(
                                product.id,
                                parseInt(e.target.value)
                              )
                            }
                            className="w-16"
                          />
                          <button
                            onClick={() => removeProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep('influencers')}
                  disabled={isPending}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={onProductsSubmit}
                  disabled={isPending}
                >
                  {isPending ? 'Creating...' : 'Create Campaign'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
