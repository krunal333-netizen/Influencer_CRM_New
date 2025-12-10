import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Download, User } from 'lucide-react';
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
import { Switch } from '../ui/switch';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { useCreateInfluencer } from '../../hooks/useInfluencers';
import {
  useScrapeProfile,
  useRunStatus,
  useRunResults,
  useCreateInfluencerFromScrapedData,
} from '../../hooks/useApify';
import { InstagramProfileData } from '../../types/models';

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
  const [dryRun, setDryRun] = useState(true);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [scrapedData, setScrapedData] = useState<InstagramProfileData | null>(
    null
  );
  const [isScraping, setIsScraping] = useState(false);

  const { mutate: createInfluencer, isPending } = useCreateInfluencer();
  const { mutate: scrapeProfile, isPending: isScrapePending } =
    useScrapeProfile();
  const { mutate: createFromScraped, isPending: isCreateFromScrapedPending } =
    useCreateInfluencerFromScrapedData();

  // Query for run status
  const { data: runStatus } = useRunStatus(currentRunId || '', !!currentRunId);

  // Query for run results (only when status is SUCCEEDED)
  const { data: runResults } = useRunResults(
    currentRunId || '',
    !!currentRunId && runStatus?.status === 'SUCCEEDED'
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateInfluencerFormData>({
    resolver: zodResolver(createInfluencerSchema),
  });

  const profileUrl = watch('profileUrl');

  // Auto-populate form when scraped data is available
  useEffect(() => {
    if (runResults?.profileData) {
      setScrapedData(runResults.profileData);
      setValue(
        'name',
        runResults.profileData.fullName || runResults.profileData.username
      );
      setValue(
        'email',
        runResults.profileData.emails?.[0] ||
          `${runResults.profileData.username}@instagram.com`
      );
      setValue('bio', runResults.profileData.bio);
      setValue('followers', runResults.profileData.followersCount);
      setValue('platform', 'Instagram');
      setCurrentRunId(null);
      setIsScraping(false);
    }
  }, [runResults, setValue]);

  // Handle scraping
  const handleScrapeProfile = () => {
    if (!profileUrl) return;

    setIsScraping(true);
    scrapeProfile(
      { instagramUrl: profileUrl, dryRun },
      {
        onSuccess: (response) => {
          setCurrentRunId(response.runId);
        },
        onError: (error) => {
          setIsScraping(false);
          console.error('Scraping failed:', error);
        },
      }
    );
  };

  // Handle creating from scraped data
  const handleCreateFromScraped = () => {
    if (!scrapedData) return;

    createFromScraped(
      { scrapedData, additionalData: { status: 'COLD' as const } },
      {
        onSuccess: () => {
          reset();
          setScrapedData(null);
          onOpenChange(false);
        },
      }
    );
  };

  const onSubmit = (data: CreateInfluencerFormData) => {
    createInfluencer(
      {
        ...data,
        status: 'COLD' as const,
      },
      {
        onSuccess: () => {
          reset();
          setScrapedData(null);
          setCurrentRunId(null);
          onOpenChange(false);
        },
      }
    );
  };

  const isLoading =
    isPending || isScrapePending || isCreateFromScrapedPending || isScraping;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Influencer</DialogTitle>
          <DialogDescription>
            Add a new influencer to your database. Auto-fetch data from
            Instagram profile URL.
          </DialogDescription>
        </DialogHeader>

        {/* Scraped Data Preview */}
        {scrapedData && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-4">
                {scrapedData.profilePictureUrl && (
                  <img
                    src={scrapedData.profilePictureUrl}
                    alt={scrapedData.fullName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{scrapedData.fullName}</h4>
                    <Badge variant="secondary">@{scrapedData.username}</Badge>
                  </div>
                  <p className="text-sm text-slate-600">{scrapedData.bio}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>
                      {scrapedData.followersCount.toLocaleString()} followers
                    </span>
                    {scrapedData.emails && scrapedData.emails.length > 0 && (
                      <span>✉️ {scrapedData.emails.length} email(s) found</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleCreateFromScraped}
                      disabled={isCreateFromScrapedPending}
                    >
                      <User className="mr-2 h-4 w-4" />
                      {isCreateFromScrapedPending
                        ? 'Creating...'
                        : 'Create from Scraped Data'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setScrapedData(null)}
                    >
                      Edit Manually
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manual Form */}
        {!scrapedData && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4">
              {/* Instagram Profile URL Section */}
              <div className="grid gap-2">
                <Label htmlFor="profileUrl">Instagram Profile URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="profileUrl"
                    type="url"
                    placeholder="https://www.instagram.com/username"
                    {...register('profileUrl')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleScrapeProfile}
                    disabled={!profileUrl || isScrapePending || isScraping}
                  >
                    {isScrapePending || isScraping ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Auto-fetch
                  </Button>
                </div>
                {errors.profileUrl && (
                  <p className="text-sm text-red-500">
                    {errors.profileUrl.message}
                  </p>
                )}

                {/* Dry-run toggle */}
                <div className="flex items-center gap-2">
                  <Switch
                    id="dryRun"
                    checked={dryRun}
                    onCheckedChange={setDryRun}
                  />
                  <Label htmlFor="dryRun" className="text-sm text-slate-600">
                    Test mode (no API calls required)
                  </Label>
                </div>
              </div>

              {/* Scraping Status */}
              {currentRunId && runStatus && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">
                        Scraping status: <strong>{runStatus.status}</strong>
                      </span>
                      {runStatus.isDryRun && (
                        <Badge variant="outline" className="text-xs">
                          Test Mode
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

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
                <Input id="bio" placeholder="Enter bio" {...register('bio')} />
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
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Influencer'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
