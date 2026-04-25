import React, { useState, useCallback } from 'react';

// Types for social sharing
export interface ShareableContent {
  id: string;
  type: 'payment_success' | 'utility_achievement' | 'savings_milestone' | 'eco_impact';
  data: {
    amount?: number;
    utility?: string;
    savings?: number;
    co2Reduced?: number;
    date?: Date;
    achievement?: string;
  };
}

export interface ShareAnalytics {
  platform: string;
  action: 'share' | 'copy_link' | 'generate_image';
  timestamp: Date;
  contentType: string;
}

// Social media platform configurations
const SOCIAL_PLATFORMS = {
  twitter: {
    name: 'Twitter',
    baseUrl: 'https://twitter.com/intent/tweet',
    color: '#1DA1F2',
    icon: '🐦',
  },
  facebook: {
    name: 'Facebook',
    baseUrl: 'https://www.facebook.com/sharer/sharer.php',
    color: '#1877F2',
    icon: '📘',
  },
  linkedin: {
    name: 'LinkedIn',
    baseUrl: 'https://www.linkedin.com/sharing/share-offsite/',
    color: '#0A66C2',
    icon: '💼',
  },
  whatsapp: {
    name: 'WhatsApp',
    baseUrl: 'https://wa.me/',
    color: '#25D366',
    icon: '💬',
  },
  telegram: {
    name: 'Telegram',
    baseUrl: 'https://t.me/share/url',
    color: '#0088CC',
    icon: '✈️',
  },
} as const;

type SocialPlatform = keyof typeof SOCIAL_PLATFORMS;

// Share text templates
const SHARE_TEMPLATES = {
  payment_success: {
    twitter: "Just paid my {utility} bill of {amount} XLM using NEPA! 🚀 #Decentralized #CryptoPayments #NEPA",
    facebook: "I just successfully paid my {utility} bill using NEPA's decentralized payment platform! 💡 Paid {amount} XLM securely on the Stellar network. Join the future of utility payments!",
    linkedin: "Successfully processed utility payment through NEPA's decentralized platform. Transaction amount: {amount} XLM for {utility} services. Demonstrating the future of blockchain-based utility payments.",
    whatsapp: "Just paid my {utility} bill of {amount} XLM using NEPA! 🚀",
    telegram: "Just paid my {utility} bill of {amount} XLM using NEPA! 🚀 #Decentralized #CryptoPayments",
  },
  utility_achievement: {
    twitter: "🏆 Achievement unlocked: {achievement} on NEPA! Saved {savings} XLM this month. #SmartSavings #NEPA",
    facebook: "Excited to share my latest achievement on NEPA! 🏆 {achievement} I've saved {savings} XLM this month through efficient utility management. Every small step counts towards a sustainable future!",
    linkedin: "Achieved significant cost savings through NEPA's utility management platform. Monthly savings of {savings} XLM demonstrates the efficiency of decentralized payment systems in utility management.",
    whatsapp: "🏆 Achievement unlocked: {achievement} on NEPA! Saved {savings} XLM this month.",
    telegram: "🏆 Achievement unlocked: {achievement} on NEPA! Saved {savings} XLM this month. #SmartSavings",
  },
  savings_milestone: {
    twitter: "💰 Milestone reached! Saved {savings} XLM on utility bills with NEPA! That's {percentage}% in savings! #FinancialFreedom #NEPA",
    facebook: "Celebrating a major milestone! 💰 I've saved {savings} XLM on utility bills using NEPA - that's {percentage}% in total savings! The power of decentralized payments and smart utility management is real.",
    linkedin: "Reached significant savings milestone through NEPA platform. Total savings of {savings} XLM represents {percentage}% cost reduction, showcasing the economic benefits of blockchain-based utility payment systems.",
    whatsapp: "💰 Milestone reached! Saved {savings} XLM on utility bills with NEPA! That's {percentage}% in savings!",
    telegram: "💰 Milestone reached! Saved {savings} XLM on utility bills with NEPA! #Savings #Milestone",
  },
  eco_impact: {
    twitter: "🌱 Reduced my carbon footprint by {co2Reduced}kg CO₂ using NEPA's green energy options! #EcoFriendly #SustainableLiving #NEPA",
    facebook: "Making a difference for the planet! 🌱 Through NEPA's green energy options, I've reduced my carbon footprint by {co2Reduced}kg CO₂ this month. Every choice matters in building a sustainable future.",
    linkedin: "Environmental impact achievement through NEPA's green energy initiatives. Carbon footprint reduction of {co2Reduced}kg CO₂ demonstrates the role of decentralized platforms in promoting sustainability.",
    whatsapp: "🌱 Reduced my carbon footprint by {co2Reduced}kg CO₂ using NEPA's green energy options!",
    telegram: "🌱 Reduced my carbon footprint by {co2Reduced}kg CO₂ using NEPA's green energy options! #EcoFriendly",
  },
} as const;

const SocialShareSimple: React.FC<{
  content: ShareableContent;
  onAnalytics?: (analytics: ShareAnalytics) => void;
  className?: string;
}> = ({ content, onAnalytics, className = '' }) => {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // Track analytics
  const trackAnalytics = useCallback((platform: string, action: ShareAnalytics['action']) => {
    const analytics: ShareAnalytics = {
      platform,
      action,
      timestamp: new Date(),
      contentType: content.type,
    };
    onAnalytics?.(analytics);
  }, [content.type, onAnalytics]);

  // Generate share text based on template
  const generateShareText = useCallback((platform: SocialPlatform): string => {
    const template = SHARE_TEMPLATES[content.type]?.[platform] || '';
    const { data } = content;
    
    let text = template;
    
    // Replace template variables
    text = text.replace(/{utility}/g, data.utility || 'utility');
    text = text.replace(/{amount}/g, data.amount?.toString() || '0');
    text = text.replace(/{savings}/g, data.savings?.toString() || '0');
    text = text.replace(/{co2Reduced}/g, data.co2Reduced?.toString() || '0');
    text = text.replace(/{achievement}/g, data.achievement || 'achievement');
    text = text.replace(/{percentage}/g, data.savings ? '15' : '0');
    
    return text;
  }, [content]);

  // Generate shareable URL
  const generateShareUrl = useCallback((platform: SocialPlatform): string => {
    const text = generateShareText(platform);
    const url = window.location.href;
    const platformConfig = SOCIAL_PLATFORMS[platform];
    
    const params = new URLSearchParams();
    
    switch (platform) {
      case 'twitter':
        params.set('text', text);
        params.set('url', url);
        if (generatedImageUrl) {
          params.set('image', generatedImageUrl);
        }
        break;
      case 'facebook':
        params.set('u', url);
        params.set('quote', text);
        break;
      case 'linkedin':
        params.set('url', url);
        break;
      case 'whatsapp':
        return `${platformConfig.baseUrl}?text=${encodeURIComponent(`${text} ${url}`)}`;
      case 'telegram':
        params.set('url', url);
        params.set('text', text);
        break;
      default:
        return url;
    }
    
    return `${platformConfig.baseUrl}?${params.toString()}`;
  }, [generateShareText, generatedImageUrl]);

  // Generate custom shareable image
  const generateShareImage = useCallback(async () => {
    setIsGeneratingImage(true);
    trackAnalytics('image_generation', 'generate_image');
    
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
      
      // Add NEPA logo/text
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
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setGeneratedImageUrl(url);
          console.log('Shareable image generated!');
        }
      }, 'image/png', 0.9);
      
    } catch (error) {
      console.error('Error generating image:', error);
      console.error('Failed to generate shareable image');
    } finally {
      setIsGeneratingImage(false);
    }
  }, [content, trackAnalytics]);

  // Handle share action
  const handleShare = useCallback((platform: SocialPlatform) => {
    const shareUrl = generateShareUrl(platform);
    trackAnalytics(platform, 'share');
    
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
  }, [generateShareUrl, trackAnalytics]);

  // Copy link to clipboard
  const copyLink = useCallback(async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      trackAnalytics('clipboard', 'copy_link');
      console.log('Link copied to clipboard!');
    } catch (error) {
      console.error('Error copying link:', error);
      console.error('Failed to copy link');
    }
  }, [trackAnalytics]);

  return (
    <div className={`social-share-container ${className}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Image Generation */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '1rem',
          border: '1px solid #e2e8f0',
          borderRadius: '0.5rem',
          backgroundColor: '#f8fafc'
        }}>
          <div>
            <h4 style={{ fontWeight: '600', margin: '0 0 0.25rem 0' }}>Custom Share Image</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Generate a custom image for sharing</p>
          </div>
          <button
            onClick={generateShareImage}
            disabled={isGeneratingImage}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: isGeneratingImage ? '#94a3b8' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: isGeneratingImage ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem'
            }}
          >
            {isGeneratingImage ? 'Generating...' : 'Generate Image'}
          </button>
        </div>

        {/* Generated Image Preview */}
        {generatedImageUrl && (
          <div style={{ 
            padding: '1rem', 
            border: '1px solid #e2e8f0', 
            borderRadius: '0.5rem',
            backgroundColor: '#f8fafc'
          }}>
            <h4 style={{ fontWeight: '600', margin: '0 0 0.5rem 0' }}>Generated Image</h4>
            <img 
              src={generatedImageUrl} 
              alt="Shareable image" 
              style={{ 
                width: '100%', 
                maxWidth: '400px', 
                height: 'auto',
                borderRadius: '0.375rem',
                margin: '0 auto',
                display: 'block'
              }}
            />
          </div>
        )}

        {/* Social Media Buttons */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '0.75rem'
        }}>
          {Object.entries(SOCIAL_PLATFORMS).map(([platform, config]) => (
            <button
              key={platform}
              onClick={() => handleShare(platform as SocialPlatform)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                border: `1px solid ${config.color}40`,
                borderRadius: '0.5rem',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                fontSize: '0.875rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{config.icon}</span>
              <span style={{ fontWeight: '500' }}>{config.name}</span>
            </button>
          ))}
        </div>

        {/* Copy Link */}
        <button
          onClick={copyLink}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            backgroundColor: '#f1f5f9',
            color: '#475569',
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            fontSize: '0.875rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e2e8f0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f1f5f9';
          }}
        >
          <span>🔗</span>
          <span>Copy Link</span>
        </button>

        {/* Share Preview */}
        <div style={{ 
          padding: '1rem', 
          border: '1px solid #e2e8f0', 
          borderRadius: '0.5rem',
          backgroundColor: '#f8fafc'
        }}>
          <h4 style={{ fontWeight: '600', margin: '0 0 0.5rem 0' }}>Share Preview (Twitter)</h4>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '0.75rem', 
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            color: '#1f2937',
            border: '1px solid #e5e7eb'
          }}>
            {generateShareText('twitter')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialShareSimple;
