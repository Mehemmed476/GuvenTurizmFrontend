"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { az } from "date-fns/locale";

interface Review {
    id: string;
    userName: string;
    text: string;
    rating: number;
    createdAt: string;
}

export default function ReviewSection({ houseId }: { houseId: string }) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [newReviewText, setNewReviewText] = useState("");
    const [newRating, setNewRating] = useState(5);
    const [submitting, setSubmitting] = useState(false);

    // Rəyləri yüklə
    useEffect(() => {
        api.get(`/Reviews/house/${houseId}`)
            .then(res => setReviews(res.data))
            .catch(err => console.error(err));
    }, [houseId]);

    // Rəy göndər
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error("Rəy yazmaq üçün giriş etməlisiniz!");
            return;
        }
        if (!newReviewText.trim()) return;

        setSubmitting(true);
        try {
            await api.post("/Reviews", {
                houseId,
                text: newReviewText,
                rating: newRating
            });

            toast.success("Rəyiniz əlavə edildi!");
            setNewReviewText("");
            setNewRating(5);

            // Siyahını yenilə (Yenisini başa əlavə et)
            const newReview: Review = {
                id: Math.random().toString(), // Müvəqqəti ID
                userName: user.userName || "Mən",
                text: newReviewText,
                rating: newRating,
                createdAt: new Date().toISOString()
            };
            setReviews(prev => [newReview, ...prev]);

        } catch (error) {
            toast.error("Rəy göndərilmədi.");
        } finally {
            setSubmitting(false);
        }
    };

    // Ulduzları göstərən kiçik helper
    const renderStars = (count: number) => {
        return Array(5).fill(0).map((_, i) => (
            <span key={i} className={i < count ? "text-yellow-400" : "text-gray-300"}>★</span>
        ));
    };

    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mt-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                ⭐ Rəylər <span className="text-gray-400 text-lg font-normal">({reviews.length})</span>
            </h3>

            {/* Rəy Yazma Formu */}
            {user ? (
                <form onSubmit={handleSubmit} className="mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-4">Təcrübənizi paylaşın</h4>

                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm font-medium text-gray-600">Qiymətləndirmə:</span>
                        <div className="flex gap-1 cursor-pointer text-2xl">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={star <= newRating ? "text-yellow-400" : "text-gray-300"}
                                    onClick={() => setNewRating(star)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>

                    <textarea
                        value={newReviewText}
                        onChange={(e) => setNewReviewText(e.target.value)}
                        placeholder="Ev necə idi? Təmizlik, rahatlıq..."
                        className="w-full p-4 rounded-xl border border-gray-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[100px]"
                        required
                    />

                    <div className="flex justify-end mt-4">
                        <button
                            disabled={submitting}
                            className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                            {submitting ? "Göndərilir..." : "Rəy Yaz"}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-blue-50 text-blue-700 p-4 rounded-xl mb-8 text-center">
                    Rəy yazmaq üçün zəhmət olmasa <span className="font-bold cursor-pointer underline">giriş edin</span>.
                </div>
            )}

            {/* Rəylər Siyahısı */}
            <div className="space-y-6">
                {reviews.length > 0 ? reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                                    {review.userName?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{review.userName}</p>
                                    <p className="text-xs text-gray-400">{format(new Date(review.createdAt), "d MMMM yyyy", { locale: az })}</p>
                                </div>
                            </div>
                            <div className="text-yellow-400 text-lg">
                                {renderStars(review.rating)}
                            </div>
                        </div>
                        <p className="text-gray-600 leading-relaxed ml-13 pl-13">
                            {review.text}
                        </p>
                    </div>
                )) : (
                    <p className="text-center text-gray-400 py-4">Hələ heç kim rəy yazmayıb. İlk siz olun!</p>
                )}
            </div>
        </div>
    );
}