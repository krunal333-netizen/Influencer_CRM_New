import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useCreateInfluencer } from '../../hooks/useInfluencers';

const createInfluencerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  followers: z.coerce.number().int().nonnegative().optional(),
  platform: z.string().optional().nullable(),
  profileUrl: z.string().url().optional().nullable(),
});

type CreateInfluencerFormData = z.infer<typeof createInfluencerSchema>;

interface CreateInfluencerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateInfluencerModal({
  open,
  onOpenChange,
}: CreateInfluencerModalProps) {
  const { mutate: createInfluencer, isPending } = useCreateInfluencer();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateInfluencerFormData>({
    resolver: zodResolver(createInfluencerSchema),
  });

  const onSubmit = (data: CreateInfluencerFormData) => {
    createInfluencer(
      {
        ...data,
        status: 'COLD',
      } as any,
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Influencer</DialogTitle>
          <DialogDescription>
            Add a new influencer to your database.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Enter influencer name"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                {...register('phone')}
              />
            </div>

            {/* Bio */}
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                placeholder="Enter bio"
                {...register('bio')}
              />
            </div>

            {/* Followers */}
            <div className="grid gap-2">
              <Label htmlFor="followers">Followers</Label>
              <Input
                id="followers"
                type="number"
                placeholder="0"
                {...register('followers')}
              />
            </div>

            {/* Platform */}
            <div className="grid gap-2">
              <Label htmlFor="platform">Platform</Label>
              <Input
                id="platform"
                placeholder="e.g., Instagram, TikTok, YouTube"
                {...register('platform')}
              />
            </div>

            {/* Profile URL */}
            <div className="grid gap-2">
              <Label htmlFor="profileUrl">Profile URL</Label>
              <Input
                id="profileUrl"
                type="url"
                placeholder="https://..."
                {...register('profileUrl')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Influencer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
