"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";

interface PriceRangeSliderProps {
    min: number;
    max: number;
    onChange: (min: number, max: number) => void;
    initialMin?: number;
    initialMax?: number;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
    min,
    max,
    onChange,
    initialMin,
    initialMax,
}) => {
    const [minVal, setMinVal] = useState(initialMin || min);
    const [maxVal, setMaxVal] = useState(initialMax || max);
    const minValRef = useRef(minVal);
    const maxValRef = useRef(maxVal);
    const range = useRef<HTMLDivElement>(null);

    // Yüzde hesabı
    const getPercent = useCallback(
        (value: number) => Math.round(((value - min) / (max - min)) * 100),
        [min, max]
    );

    // Sol aralık (boşluk) ayarı
    useEffect(() => {
        const minPercent = getPercent(minVal);
        const maxPercent = getPercent(maxValRef.current);

        if (range.current) {
            range.current.style.left = `${minPercent}%`;
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [minVal, getPercent]);

    // Sağ aralık (genişlik) ayarı
    useEffect(() => {
        const minPercent = getPercent(minValRef.current);
        const maxPercent = getPercent(maxVal);

        if (range.current) {
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [maxVal, getPercent]);

    // Değişiklikleri yukarı bildir
    useEffect(() => {
        onChange(minVal, maxVal);
    }, [minVal, maxVal]);

    return (
        <div className="w-full mb-8">
            {/* Slider Çubuğu */}
            <div className="relative w-full h-2 rounded-lg bg-gray-200 mt-4 mb-8">
                {/* Aktif (Dolu) Kısım: Sitenin ana rengini (bg-primary) kullanır */}
                <div ref={range} className="absolute h-2 bg-primary rounded-lg z-10" />

                {/* Sol Yuvarlak (Thumb) */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={minVal}
                    onChange={(event) => {
                        const value = Math.min(Number(event.target.value), maxVal - 1);
                        setMinVal(value);
                        minValRef.current = value;
                    }}
                    // 'text-primary' ile rengi, 'top-1/2' ile hizalamayı ayarladık
                    className="thumb thumb--left z-[3] w-full absolute h-0 outline-none pointer-events-none appearance-none text-primary top-1/2"
                    style={{ zIndex: minVal > max - 100 ? "5" : "3" }}
                />

                {/* Sağ Yuvarlak (Thumb) */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={maxVal}
                    onChange={(event) => {
                        const value = Math.max(Number(event.target.value), minVal + 1);
                        setMaxVal(value);
                        maxValRef.current = value;
                    }}
                    className="thumb thumb--right z-[4] w-full absolute h-0 outline-none pointer-events-none appearance-none text-primary top-1/2"
                />

                {/* Alt Fiyat Etiketleri */}
                <div className="absolute top-6 left-0 text-xs text-gray-500 font-medium">
                    ₼{minVal}
                </div>
                <div className="absolute top-6 right-0 text-xs text-gray-500 font-medium">
                    ₼{maxVal}
                </div>
            </div>

            {/* Manuel Giriş Kutuları */}
            <div className="flex items-center gap-2 mt-6">
                <div className="relative w-full">
                    <span className="absolute left-3 top-2 text-gray-400 text-sm">₼</span>
                    <input
                        type="number"
                        value={minVal}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            if (val < maxVal && val >= min) setMinVal(val);
                        }}
                        className="w-full pl-7 pr-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    />
                </div>
                <span className="text-gray-400">-</span>
                <div className="relative w-full">
                    <span className="absolute left-3 top-2 text-gray-400 text-sm">₼</span>
                    <input
                        type="number"
                        value={maxVal}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            if (val > minVal && val <= max) setMaxVal(val);
                        }}
                        className="w-full pl-7 pr-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    />
                </div>
            </div>

            {/* Özel CSS: Yuvarlak butonların tasarımı */}
            <style jsx>{`
        /* Webkit (Chrome, Safari, Edge) */
        .thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: all;
          width: 24px; /* Daha büyük */
          height: 24px;
          background-color: currentColor; /* İçi dolu renk (Primary) */
          border: 3px solid white; /* Beyaz çerçeve */
          border-radius: 50%;
          cursor: pointer;
          /* Tam ortalamak için transform */
          transform: translateY(-50%); 
          box-shadow: 0 2px 6px rgba(0,0,0,0.2); /* Gölge */
          transition: transform 0.1s, box-shadow 0.1s;
        }
        .thumb::-webkit-slider-thumb:hover {
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }

        /* Firefox */
        .thumb::-moz-range-thumb {
          pointer-events: all;
          width: 24px;
          height: 24px;
          background-color: currentColor;
          border: 3px solid white;
          border-radius: 50%;
          cursor: pointer;
          transform: translateY(-50%); /* Firefox bazen bunu farklı işler ama genellikle gerekmez, gerekirse kaldırabilirsin */
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          transition: transform 0.1s, box-shadow 0.1s;
          box-sizing: border-box;
        }
        .thumb::-moz-range-thumb:hover {
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
      `}</style>
        </div>
    );
};

export default PriceRangeSlider;