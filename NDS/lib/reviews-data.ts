export interface ProductReview {
  id: string;
  productId: string;
  productSlug: string;
  orderId: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  rating: number; // 1 to 5
  comment: string;
  imageUrl?: string | null;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface ProductReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export function calculateReviewStats(reviews: ProductReview[]): ProductReviewStats {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: distribution,
    };
  }

  let totalScore = 0;
  for (const rev of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(rev.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[star] = (distribution[star] || 0) + 1;
    totalScore += rev.rating;
  }

  const averageRating = Number((totalScore / reviews.length).toFixed(1));

  return {
    averageRating,
    totalReviews: reviews.length,
    ratingDistribution: distribution,
  };
}
