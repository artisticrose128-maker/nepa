import { useState, useCallback } from 'react';
import { ShareableContent, ShareAnalytics } from '../components/SocialShare';
import { OpenGraphData, TwitterCardData } from '../components/OpenGraphMeta';
import socialAnalyticsService from '../services/SocialAnalytics';

export interface UseSocialSharingOptions {
  userId?: string;
  baseUrl?: string;
  defaultHashtags?: string[];
  trackingEnabled?: boolean;
}

export interface SocialSharingState {
  isSharing: boolean;
  shareUrl: string;
  generatedImageUrl?: string;
  analytics: ShareAnalytics[];
  error?: string;
}

export const useSocialSharing = (options: UseSocialSharingOptions = {}) => {
  const [state, setState] = useState<SocialSharingState>({
    isSharing: false,
    shareUrl: window.location.href,
    analytics: [],
  });

  const {
    userId,
    baseUrl = window.location.origin,
    defaultHashtags = ['NEPA', 'CryptoPayments', 'Decentralized'],
    trackingEnabled = true,
  } = options;

  // Track analytics event
  const trackShare = useCallback((analytics: ShareAnalytics, metadata?: any) => {
    if (trackingEnabled) {
      socialAnalyticsService.trackEvent(analytics, userId, metadata);
      setState(prev => ({
        ...prev,
        analytics: [...prev.analytics, analytics],
      }));
    }
  }, [userId, trackingEnabled]);

  // Generate OpenGraph metadata
  const generateOpenGraphData = useCallback((content: ShareableContent): OpenGraphData => {
    const { type, data } = content;
    const url = `${baseUrl}/share/${content.id}`;

    let title = '';
    let description = '';
    let image = '';

    switch (type) {
      case 'payment_success':
        title = `Successful Payment - ${data.utility || 'Utility'} Bill`;
        description = `Successfully paid ${data.utility || 'utility'} bill of ${data.amount || 0} XLM using NEPA's decentralized platform.`;
        break;
      case 'utility_achievement':
        title = `Achievement Unlocked - ${data.achievement || 'Milestone'}`;
        description = `Achieved ${data.achievement || 'milestone'} with NEPA! Saved ${data.savings || 0} XLM this month.`;
        break;
      case 'savings_milestone':
        title = 'Savings Milestone Reached!';
        description = `Saved ${data.savings || 0} XLM on utility bills with NEPA! Join the decentralized payment revolution.`;
        break;
      case 'eco_impact':
        title = 'Environmental Impact Achieved!';
        description = `Reduced carbon footprint by ${data.co2Reduced || 0}kg CO₂ using NEPA's green energy options.`;
        break;
    }

    return {
      title,
      description,
      url,
      image: state.generatedImageUrl,
      imageAlt: title,
      type: 'article',
      siteName: 'NEPA Platform',
      locale: 'en_US',
      hashtags: defaultHashtags,
      publishedTime: data.date?.toISOString(),
      tags: [type, ...defaultHashtags],
    };
  }, [baseUrl, defaultHashtags, state.generatedImageUrl]);

  // Generate Twitter Card data
  const generateTwitterCardData = useCallback((content: ShareableContent): TwitterCardData => {
    const { type, data } = content;
    const url = `${baseUrl}/share/${content.id}`;

    let title = '';
    let description = '';

    switch (type) {
      case 'payment_success':
        title = `Payment Success - ${data.utility || 'Utility'}`;
        description = `Paid ${data.utility || 'utility'} bill of ${data.amount || 0} XLM with NEPA! 🚀`;
        break;
      case 'utility_achievement':
        title = `Achievement: ${data.achievement || 'Milestone'}`;
        description = `🏆 ${data.achievement || 'Achievement'} unlocked! Saved ${data.savings || 0} XLM.`;
        break;
      case 'savings_milestone':
        title = '💰 Savings Milestone!';
        description = `Saved ${data.savings || 0} XLM on utility bills with NEPA!`;
        break;
      case 'eco_impact':
        title = '🌱 Eco Impact Achieved!';
        description = `Reduced carbon footprint by ${data.co2Reduced || 0}kg CO₂ with NEPA!`;
        break;
    }

    return {
      card: 'summary_large_image',
      site: '@nepa_platform',
      creator: userId ? `@${userId}` : undefined,
      title,
      description,
      image: state.generatedImageUrl,
      imageAlt: title,
    };
  }, [baseUrl, userId, state.generatedImageUrl]);

  // Generate shareable image
  const generateShareImage = useCallback(async (content: ShareableContent): Promise<string | null> => {
    setState(prev => ({ ...prev, isSharing: true, error: undefined }));

    try {
      // Create canvas for image generation
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // Set canvas size (optimal for social media)
      canvas.width = 1200;
      canvas.height = 630;

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#1a365d'); // NEPA blue
      gradient.addColorStop(1, '#2d3748'); // Dark gray
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add NEPA branding
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('NEPA', canvas.width / 2, 80);

      // Add content based on type
      ctx.font = '32px Arial';
      const { data } = content;

      let mainText = '';
      let subText = '';
      let icon = '';

      switch (content.type) {
        case 'payment_success':
          mainText = 'Payment Successful!';
          subText = `${data.utility || 'Utility'} • ${data.amount || 0} XLM`;
          icon = '✅';
          break;
        case 'utility_achievement':
          mainText = data.achievement || 'Achievement Unlocked!';
          subText = `Saved ${data.savings || 0} XLM`;
          icon = '🏆';
          break;
        case 'savings_milestone':
          mainText = 'Savings Milestone!';
          subText = `${data.savings || 0} XLM saved`;
          icon = '💰';
          break;
        case 'eco_impact':
          mainText = 'Eco Impact!';
          subText = `${data.co2Reduced || 0}kg CO₂ reduced`;
          icon = '🌱';
          break;
      }

      // Add icon
      ctx.font = '48px Arial';
      ctx.fillText(icon, canvas.width / 2, 180);

      // Add main text
      ctx.font = '32px Arial';
      ctx.fillText(mainText, canvas.width / 2, 280);

      // Add sub text
      ctx.font = '24px Arial';
      ctx.fillText(subText, canvas.width / 2, 350);

      // Add date
      if (data.date) {
        ctx.font = '18px Arial';
        ctx.fillText(data.date.toLocaleDateString(), canvas.width / 2, 420);
      }

      // Add footer
      ctx.font = '16px Arial';
      ctx.fillText('nepa-platform.com', canvas.width / 2, 580);

      // Convert canvas to blob and create URL
      const imageUrl = await new Promise<string>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png', 0.9);
      });

      setState(prev => ({
        ...prev,
        generatedImageUrl: imageUrl,
        isSharing: false,
      }));

      trackShare({
        platform: 'image_generation',
        action: 'generate_image',
        timestamp: new Date(),
        contentType: content.type,
      }, {
        contentId: content.id,
        contentType: content.type,
        imageUrl,
      });

      return imageUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
      setState(prev => ({
        ...prev,
        isSharing: false,
        error: errorMessage,
      }));
      return null;
    }
  }, [trackShare]);

  // Share to social media
  const shareToSocial = useCallback(async (content: ShareableContent, platform: string) => {
    setState(prev => ({ ...prev, isSharing: true, error: undefined }));

    try {
      // Generate image if not already generated
      if (!state.generatedImageUrl) {
        await generateShareImage(content);
      }

      // Create share URL based on platform
      const shareUrl = createShareUrl(content, platform, state.generatedImageUrl);
      
      // Open share dialog
      const width = 600;
      const height = 400;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;

      window.open(
        shareUrl,
        `share-${platform}`,
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );

      trackShare({
        platform,
        action: 'share',
        timestamp: new Date(),
        contentType: content.type,
      }, {
        contentId: content.id,
        contentType: content.type,
        shareUrl,
        imageUrl: state.generatedImageUrl,
      });

      setState(prev => ({ ...prev, isSharing: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to share';
      setState(prev => ({
        ...prev,
        isSharing: false,
        error: errorMessage,
      }));
    }
  }, [state.generatedImageUrl, generateShareImage, trackShare]);

  // Copy share link
  const copyShareLink = useCallback(async (content: ShareableContent) => {
    try {
      const shareUrl = `${baseUrl}/share/${content.id}`;
      await navigator.clipboard.writeText(shareUrl);

      trackShare({
        platform: 'clipboard',
        action: 'copy_link',
        timestamp: new Date(),
        contentType: content.type,
      }, {
        contentId: content.id,
        contentType: content.type,
        shareUrl,
      });

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to copy link',
      }));
      return false;
    }
  }, [baseUrl, trackShare]);

  // Get analytics summary
  const getAnalytics = useCallback((days: number = 30) => {
    return socialAnalyticsService.getSummary(days);
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setState({
      isSharing: false,
      shareUrl: window.location.href,
      analytics: [],
      error: undefined,
    });
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    generateShareImage,
    shareToSocial,
    copyShareLink,
    reset,
    
    // Data generators
    generateOpenGraphData,
    generateTwitterCardData,
    getAnalytics,
    
    // Utilities
    isReady: !state.isSharing,
    hasError: !!state.error,
    error: state.error,
  };
};

// Helper function to create share URLs
function createShareUrl(content: ShareableContent, platform: string, imageUrl?: string): string {
  const { type, data } = content;
  const baseUrl = window.location.href;
  
  // Generate share text
  let text = '';
  switch (type) {
    case 'payment_success':
      text = `Just paid my ${data.utility || 'utility'} bill of ${data.amount || 0} XLM using NEPA! 🚀 #NEPA #CryptoPayments`;
      break;
    case 'utility_achievement':
      text = `🏆 Achievement unlocked: ${data.achievement || 'milestone'} on NEPA! Saved ${data.savings || 0} XLM. #NEPA #SmartSavings`;
      break;
    case 'savings_milestone':
      text = `💰 Saved ${data.savings || 0} XLM on utility bills with NEPA! #NEPA #Savings`;
      break;
    case 'eco_impact':
      text = `🌱 Reduced my carbon footprint by ${data.co2Reduced || 0}kg CO₂ using NEPA! #NEPA #EcoFriendly`;
      break;
  }

  const params = new URLSearchParams();
  
  switch (platform) {
    case 'twitter':
      params.set('text', text);
      params.set('url', baseUrl);
      if (imageUrl) params.set('image', imageUrl);
      return `https://twitter.com/intent/tweet?${params.toString()}`;
      
    case 'facebook':
      params.set('u', baseUrl);
      params.set('quote', text);
      return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
      
    case 'linkedin':
      params.set('url', baseUrl);
      params.set('summary', text);
      return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
      
    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(`${text} ${baseUrl}`)}`;
      
    case 'telegram':
      params.set('url', baseUrl);
      params.set('text', text);
      return `https://t.me/share/url?${params.toString()}`;
      
    default:
      return baseUrl;
  }
}

export default useSocialSharing;
