'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Location {
  name: string;
  icon: string;
}

interface MapComponentProps {
  locations: Location[];
}

export default function MapComponent({ locations }: MapComponentProps) {
  return (
    <div className="relative">
      {/* Map Container */}
      <Card className="adventure-glow bg-card/90 backdrop-blur-sm p-8 oval-card">
        <CardContent className="p-0">
          <div className="relative bg-gradient-to-br from-accent/10 to-primary/10 rounded-3xl p-8 min-h-[500px]">
            {/* Málaga Outline */}
            <div className="absolute inset-0 opacity-10">
              <svg viewBox="0 0 400 300" className="w-full h-full">
                <path
                  d="M50 150 Q100 100 150 120 Q200 140 250 130 Q300 120 350 140 Q380 160 370 200 Q350 240 300 250 Q250 260 200 250 Q150 240 100 220 Q50 200 50 150 Z"
                  fill="currentColor"
                  className="text-primary"
                />
              </svg>
            </div>

            {/* Location Points */}
            <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 h-full">
              {locations.map((location, index) => (
                <div
                  key={index}
                  className="relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-accent/50 bg-card/50 hover:border-accent rounded-organic transition-all duration-300 hover:scale-105 min-h-[120px]"
                >
                  <div className="text-2xl mb-2">
                    {location.icon}
                  </div>
                  <h3 className="text-xs font-semibold text-center text-foreground leading-tight">
                    {location.name}
                  </h3>

                  {/* Mystery indicator */}
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-2xl p-3 border border-border">
              <h4 className="text-sm font-semibold text-accent mb-2">🗺️ Misterios</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                  <span>Lugar Misterioso</span>
                </div>
              </div>
            </div>

            {/* Compass */}
            <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-full p-3 border border-border">
              <div className="text-2xl">🧭</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Card className="bg-card/90 backdrop-blur-sm oval-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">12</div>
            <div className="text-sm text-muted-foreground">Misterios por Descubrir</div>
          </CardContent>
        </Card>

        <Card className="bg-card/90 backdrop-blur-sm oval-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">3-6h</div>
            <div className="text-sm text-muted-foreground">Duración Estimada</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
