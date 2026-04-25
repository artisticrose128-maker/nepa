import React, { useState } from 'react';
import SocialShare from './SocialShare';
import { useSocialSharing } from '../hooks/useSocialSharing';
import { ShareableContent } from './SocialShare';

const SocialShareExample: React.FC = () => {
  const [selectedContent, setSelectedContent] = useState<ShareableContent>({
    id: 'example-001',
    type: 'payment_success',
    data: {
      amount: 150,
      utility: 'Electricity',
      date: new Date(),
    },
  });

  const {
    generateOpenGraphData,
    generateTwitterCardData,
    getAnalytics,
    isSharing,
    generatedImageUrl,
    error,
  } = useSocialSharing({
    userId: 'user123',
    trackingEnabled: true,
  });

  // Example content types
  const exampleContents: ShareableContent[] = [
    {
      id: 'payment-001',
      type: 'payment_success',
      data: {
        amount: 150,
        utility: 'Electricity',
        date: new Date(),
      },
    },
    {
      id: 'achievement-001',
      type: 'utility_achievement',
      data: {
        achievement: 'Energy Saver Pro',
        savings: 25,
        date: new Date(),
      },
    },
    {
      id: 'savings-001',
      type: 'savings_milestone',
      data: {
        savings: 500,
        date: new Date(),
      },
    },
    {
      id: 'eco-001',
      type: 'eco_impact',
      data: {
        co2Reduced: 120,
        date: new Date(),
      },
    },
  ];

  const handleAnalytics = (analytics: any) => {
    console.log('Social sharing analytics:', analytics);
  };

  const openGraphData = generateOpenGraphData(selectedContent);
  const twitterCardData = generateTwitterCardData(selectedContent);
  const analytics = getAnalytics(30);

  return (
    <div className="social-share-example p-6 max-w-4xl mx-auto">

      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Social Sharing Features Demo
          </h1>
          <p className="text-muted-foreground">
            Explore the social sharing capabilities of the NEPA platform
          </p>
        </div>

        {/* Content Selector */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Select Content to Share
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {exampleContents.map((content) => (
              <button
                key={content.id}
                onClick={() => setSelectedContent(content)}
                className={`p-4 rounded-lg border transition-colors ${selectedContent.id === content.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-accent'
                  }`}
              >
                <div className="text-2xl mb-2">
                  {content.type === 'payment_success' && '💳'}
                  {content.type === 'utility_achievement' && '🏆'}
                  {content.type === 'savings_milestone' && '💰'}
                  {content.type === 'eco_impact' && '🌱'}
                </div>
                <div className="font-medium text-foreground">
                  {content.type === 'payment_success' && 'Payment Success'}
                  {content.type === 'utility_achievement' && 'Achievement'}
                  {content.type === 'savings_milestone' && 'Savings Milestone'}
                  {content.type === 'eco_impact' && 'Eco Impact'}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {content.type === 'payment_success' && `${content.data.utility} • ${content.data.amount} XLM`}
                  {content.type === 'utility_achievement' && content.data.achievement}
                  {content.type === 'savings_milestone' && `${content.data.savings} XLM saved`}
                  {content.type === 'eco_impact' && `${content.data.co2Reduced}kg CO₂`}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Social Share Component */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Share This Content
          </h2>
          <SocialShare
            content={selectedContent}
            onAnalytics={handleAnalytics}
            className="w-full"
          />
        </div>

        {/* Status Display */}
        {(isSharing || error || generatedImageUrl) && (
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Sharing Status
            </h2>
            <div className="space-y-2">
              {isSharing && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Processing share...</span>
                </div>
              )}
              {error && (
                <div className="text-red-600">
                  <strong>Error:</strong> {error}
                </div>
              )}
              {generatedImageUrl && (
                <div className="text-green-600">
                  <strong>Image Generated:</strong> Shareable image ready
                </div>
              )}
            </div>
          </div>
        )}

        {/* Generated Image Preview */}
        {generatedImageUrl && (
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Generated Shareable Image
            </h2>
            <div className="flex justify-center">
              <img
                src={generatedImageUrl}
                alt="Shareable image"
                className="max-w-full rounded-lg shadow-lg"
                style={{ maxHeight: '400px' }}
              />
            </div>
          </div>
        )}

        {/* OpenGraph Metadata Preview */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            OpenGraph Metadata
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-foreground mb-2">Basic Info</h3>
              <div className="bg-muted p-3 rounded text-sm">
                <div><strong>Title:</strong> {openGraphData.title}</div>
                <div><strong>Description:</strong> {openGraphData.description}</div>
                <div><strong>URL:</strong> {openGraphData.url}</div>
                <div><strong>Type:</strong> {openGraphData.type}</div>
                <div><strong>Site Name:</strong> {openGraphData.siteName}</div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-2">Twitter Card</h3>
              <div className="bg-muted p-3 rounded text-sm">
                <div><strong>Card Type:</strong> {twitterCardData.card}</div>
                <div><strong>Site:</strong> {twitterCardData.site}</div>
                <div><strong>Title:</strong> {twitterCardData.title}</div>
                <div><strong>Description:</strong> {twitterCardData.description}</div>
                {twitterCardData.image && (
                  <div><strong>Image:</strong> Available</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Social Sharing Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-muted p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-foreground">
                {analytics.totalShares}
              </div>
              <div className="text-sm text-muted-foreground">Total Shares</div>
            </div>
            <div className="bg-muted p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-foreground">
                {Object.keys(analytics.sharesByPlatform).length}
              </div>
              <div className="text-sm text-muted-foreground">Platforms</div>
            </div>
            <div className="bg-muted p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-foreground">
                {Object.keys(analytics.sharesByContentType).length}
              </div>
              <div className="text-sm text-muted-foreground">Content Types</div>
            </div>
            <div className="bg-muted p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-foreground">
                {analytics.topContent.length}
              </div>
              <div className="text-sm text-muted-foreground">Top Content</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-foreground mb-2">Shares by Platform</h3>
              <div className="space-y-2">
                {Object.entries(analytics.sharesByPlatform).map(([platform, count]) => (
                  <div key={platform} className="flex justify-between items-center">
                    <span className="capitalize">{platform}</span>
                    <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-2">Shares by Content Type</h3>
              <div className="space-y-2">
                {Object.entries(analytics.sharesByContentType).map(([contentType, count]) => (
                  <div key={contentType} className="flex justify-between items-center">
                    <span className="capitalize">{contentType.replace('_', ' ')}</span>
                    <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {analytics.topContent.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-foreground mb-2">Top Content</h3>
              <div className="space-y-2">
                {analytics.topContent.map((content, index) => (
                  <div key={content.contentId} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{index + 1}. {content.contentType}</span>
                      <span className="text-muted-foreground ml-2">({content.contentId})</span>
                    </div>
                    <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm">
                      {content.shareCount} shares
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Implementation Notes */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Implementation Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-foreground mb-2">✅ Implemented Features</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Social media integration (Twitter, Facebook, LinkedIn, WhatsApp, Telegram)</li>
                <li>• Custom shareable image generation</li>
                <li>• Share text templates for different content types</li>
                <li>• OpenGraph metadata optimization</li>
                <li>• Twitter Card support</li>
                <li>• Social media analytics tracking</li>
                <li>• Copy link functionality</li>
                <li>• Responsive design</li>
                <li>• Error handling and loading states</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">🔧 Technical Details</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Canvas-based image generation</li>
                <li>• LocalStorage analytics persistence</li>
                <li>• Custom React hook integration</li>
                <li>• TypeScript type safety</li>
                <li>• SEO-optimized metadata</li>
                <li>• Structured data (JSON-LD)</li>
                <li>• Progressive enhancement</li>
                <li>• Cross-platform compatibility</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialShareExample;
