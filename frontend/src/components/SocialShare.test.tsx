import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import SocialShare from './SocialShare';
import { ShareableContent } from './SocialShare';

// Mock window.open
const mockOpen = jest.fn();
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockOpen,
});

// Mock navigator.clipboard
const mockWriteText = jest.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: {
    writeText: mockWriteText,
  },
});

// Mock canvas
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: jest.fn(() => ({
    createLinearGradient: jest.fn(() => ({
      addColorStop: jest.fn(),
    })),
    fillStyle: '',
    fillRect: jest.fn(),
    font: '',
    textAlign: 'center',
    fillText: jest.fn(),
    toBlob: jest.fn((callback) => {
      const blob = new Blob(['test'], { type: 'image/png' });
      callback(blob);
    }),
  })),
} as any;

HTMLCanvasElement.prototype.getContext = mockCanvas.getContext;

// Mock URL.createObjectURL
const mockCreateObjectURL = jest.fn(() => 'mock-url');
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: mockCreateObjectURL,
});

describe('SocialShare Component', () => {
  const mockContent: ShareableContent = {
    id: 'test-001',
    type: 'payment_success',
    data: {
      amount: 150,
      utility: 'Electricity',
      date: new Date('2024-01-15'),
    },
  };

  const mockAnalytics = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders social sharing interface', () => {
    render(<SocialShare content={mockContent} onAnalytics={mockAnalytics} />);
    
    expect(screen.getByText('Custom Share Image')).toBeInTheDocument();
    expect(screen.getByText('Generate Image')).toBeInTheDocument();
    expect(screen.getByText('🐦')).toBeInTheDocument(); // Twitter
    expect(screen.getByText('📘')).toBeInTheDocument(); // Facebook
    expect(screen.getByText('💼')).toBeInTheDocument(); // LinkedIn
    expect(screen.getByText('💬')).toBeInTheDocument(); // WhatsApp
    expect(screen.getByText('✈️')).toBeInTheDocument(); // Telegram
    expect(screen.getByText('Copy Link')).toBeInTheDocument();
  });

  it('generates shareable image when button is clicked', async () => {
    render(<SocialShare content={mockContent} onAnalytics={mockAnalytics} />);
    
    const generateButton = screen.getByText('Generate Image');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockAnalytics).toHaveBeenCalledWith({
        platform: 'image_generation',
        action: 'generate_image',
        timestamp: expect.any(Date),
        contentType: 'payment_success',
      });
    });
  });

  it('opens Twitter share dialog when Twitter button is clicked', async () => {
    render(<SocialShare content={mockContent} onAnalytics={mockAnalytics} />);
    
    // First generate an image
    const generateButton = screen.getByText('Generate Image');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    // Then click Twitter share
    const twitterButton = screen.getByText('Twitter');
    fireEvent.click(twitterButton);

    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      'share-twitter',
      expect.stringContaining('width=600')
    );

    expect(mockAnalytics).toHaveBeenCalledWith({
      platform: 'twitter',
      action: 'share',
      timestamp: expect.any(Date),
      contentType: 'payment_success',
    });
  });

  it('copies link to clipboard when Copy Link button is clicked', async () => {
    render(<SocialShare content={mockContent} onAnalytics={mockAnalytics} />);
    
    const copyButton = screen.getByText('Copy Link');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(window.location.href);
      expect(mockAnalytics).toHaveBeenCalledWith({
        platform: 'clipboard',
        action: 'copy_link',
        timestamp: expect.any(Date),
        contentType: 'payment_success',
      });
    });
  });

  it('displays share preview for Twitter', () => {
    render(<SocialShare content={mockContent} onAnalytics={mockAnalytics} />);
    
    expect(screen.getByText('Share Preview (Twitter)')).toBeInTheDocument();
    expect(screen.getByText(/Just paid my Electricity bill of 150 XLM using NEPA!/)).toBeInTheDocument();
  });

  it('shows generated image preview after image generation', async () => {
    render(<SocialShare content={mockContent} onAnalytics={mockAnalytics} />);
    
    const generateButton = screen.getByText('Generate Image');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Generated Image')).toBeInTheDocument();
      expect(screen.getByAltText('Shareable image')).toBeInTheDocument();
    });
  });

  it('handles different content types correctly', () => {
    const achievementContent: ShareableContent = {
      id: 'achievement-001',
      type: 'utility_achievement',
      data: {
        achievement: 'Energy Saver Pro',
        savings: 25,
        date: new Date('2024-01-15'),
      },
    };

    render(<SocialShare content={achievementContent} onAnalytics={mockAnalytics} />);
    
    expect(screen.getByText('Share Preview (Twitter)')).toBeInTheDocument();
    expect(screen.getByText(/🏆 Achievement unlocked: Energy Saver Pro on NEPA!/)).toBeInTheDocument();
  });

  it('handles clipboard errors gracefully', async () => {
    mockWriteText.mockRejectedValueOnce(new Error('Clipboard error'));
    
    render(<SocialShare content={mockContent} onAnalytics={mockAnalytics} />);
    
    const copyButton = screen.getByText('Copy Link');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalled();
    });
  });

  it('generates correct share URLs for different platforms', async () => {
    render(<SocialShare content={mockContent} onAnalytics={mockAnalytics} />);
    
    // Generate image first
    const generateButton = screen.getByText('Generate Image');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    // Test different platforms
    const platforms = ['Twitter', 'Facebook', 'LinkedIn', 'WhatsApp', 'Telegram'];
    
    platforms.forEach(platform => {
      mockOpen.mockClear();
      const button = screen.getByText(platform);
      fireEvent.click(button);

      expect(mockOpen).toHaveBeenCalled();
      
      const callArgs = mockOpen.mock.calls[0];
      const url = callArgs[0];
      
      if (platform === 'Twitter') {
        expect(url).toContain('twitter.com/intent/tweet');
      } else if (platform === 'Facebook') {
        expect(url).toContain('facebook.com/sharer/sharer.php');
      } else if (platform === 'LinkedIn') {
        expect(url).toContain('linkedin.com/sharing/share-offsite/');
      } else if (platform === 'WhatsApp') {
        expect(url).toContain('wa.me/');
      } else if (platform === 'Telegram') {
        expect(url).toContain('t.me/share/url');
      }
    });
  });

  it('includes correct hashtags in share text', () => {
    render(<SocialShare content={mockContent} onAnalytics={mockAnalytics} />);
    
    const previewText = screen.getByText(/Share Preview \(Twitter\)/).nextSibling?.textContent;
    expect(previewText).toContain('#NEPA');
    expect(previewText).toContain('#CryptoPayments');
    expect(previewText).toContain('#Decentralized');
  });

  it('handles eco impact content type', () => {
    const ecoContent: ShareableContent = {
      id: 'eco-001',
      type: 'eco_impact',
      data: {
        co2Reduced: 120,
        date: new Date('2024-01-15'),
      },
    };

    render(<SocialShare content={ecoContent} onAnalytics={mockAnalytics} />);
    
    const previewText = screen.getByText(/Share Preview \(Twitter\)/).nextSibling?.textContent;
    expect(previewText).toContain('🌱 Reduced my carbon footprint by 120kg CO₂');
    expect(previewText).toContain('#EcoFriendly');
    expect(previewText).toContain('#SustainableLiving');
  });

  it('handles savings milestone content type', () => {
    const savingsContent: ShareableContent = {
      id: 'savings-001',
      type: 'savings_milestone',
      data: {
        savings: 500,
        date: new Date('2024-01-15'),
      },
    };

    render(<SocialShare content={savingsContent} onAnalytics={mockAnalytics} />);
    
    const previewText = screen.getByText(/Share Preview \(Twitter\)/).nextSibling?.textContent;
    expect(previewText).toContain('💰 Milestone reached!');
    expect(previewText).toContain('Saved 500 XLM');
    expect(previewText).toContain('#FinancialFreedom');
  });

  it('disables generate button during image generation', async () => {
    render(<SocialShare content={mockContent} onAnalytics={mockAnalytics} />);
    
    const generateButton = screen.getByText('Generate Image');
    expect(generateButton).not.toBeDisabled();
    
    fireEvent.click(generateButton);
    expect(generateButton).toBeDisabled();
    expect(screen.getByText('Generating...')).toBeInTheDocument();
  });

  it('shows loading state correctly', () => {
    render(<SocialShare content={mockContent} onAnalytics={mockAnalytics} />);
    
    const generateButton = screen.getByText('Generate Image');
    fireEvent.click(generateButton);
    
    expect(screen.getByText('Generating...')).toBeInTheDocument();
    expect(generateButton).toBeDisabled();
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-social-share-class';
    render(<SocialShare content={mockContent} onAnalytics={mockAnalytics} className={customClass} />);
    
    const container = screen.getByText('Custom Share Image').closest('.social-share-container');
    expect(container).toHaveClass(customClass);
  });

  it('works without analytics callback', () => {
    render(<SocialShare content={mockContent} />);
    
    const generateButton = screen.getByText('Generate Image');
    fireEvent.click(generateButton);
    
    // Should not throw error even without analytics callback
    expect(mockCreateObjectURL).toHaveBeenCalled();
  });

  it('generates correct image dimensions', async () => {
    render(<SocialShare content={mockContent} onAnalytics={mockAnalytics} />);
    
    const generateButton = screen.getByText('Generate Image');
    fireEvent.click(generateButton);

    await waitFor(() => {
      const canvasContext = mockCanvas.getContext('2d');
      expect(canvasContext.fillRect).toHaveBeenCalledWith(0, 0, 1200, 630);
    });
  });

  it('includes NEPA branding in generated image', async () => {
    render(<SocialShare content={mockContent} onAnalytics={mockAnalytics} />);
    
    const generateButton = screen.getByText('Generate Image');
    fireEvent.click(generateButton);

    await waitFor(() => {
      const canvasContext = mockCanvas.getContext('2d');
      expect(canvasContext.fillText).toHaveBeenCalledWith('NEPA', 600, 80);
    });
  });

  it('handles canvas errors gracefully', async () => {
    // Mock canvas to throw error
    mockCanvas.getContext.mockImplementationOnce(() => null);
    
    render(<SocialShare content={mockContent} onAnalytics={mockAnalytics} />);
    
    const generateButton = screen.getByText('Generate Image');
    fireEvent.click(generateButton);

    // Should not throw error, just handle gracefully
    await waitFor(() => {
      expect(mockAnalytics).not.toHaveBeenCalledWith({
        platform: 'image_generation',
        action: 'generate_image',
        timestamp: expect.any(Date),
        contentType: 'payment_success',
      });
    });
  });
});
