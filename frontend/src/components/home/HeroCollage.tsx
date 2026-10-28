import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { heroTiles, type HeroTile } from "@/data/hero";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface TileProps {
  tile: HeroTile;
  index: number;
  className?: string;
  featured?: boolean;
}

function Tile({ tile, index, className, featured = false }: TileProps) {
  const Icon = tile.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 + index * 0.1, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2, delay: 0 } }}
      className={cn("relative", className)}
    >
      <Link
        to={tile.to}
        className="group absolute inset-0 overflow-hidden rounded-2xl border bg-card shadow-md transition-shadow hover:shadow-lg"
      >
        {tile.image ? (
          <img
            src={tile.image}
            alt={tile.name}
            width={featured ? 1200 : 600}
            height={featured ? 800 : 400}
            loading={featured ? "eager" : "lazy"}
            fetchPriority={featured ? "high" : "auto"}
            decoding="async"
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-linear-to-br from-accent via-muted to-secondary">
            <Icon
              className={cn(
                "text-primary/40",
                featured ? "size-24" : "size-14",
              )}
              aria-hidden="true"
            />
          </div>
        )}

        {tile.badge && (
          <Badge
            variant="primary"
            className="absolute left-3 top-3 bg-background/90 shadow-sm backdrop-blur"
          >
            {tile.badge}
          </Badge>
        )}

        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-xl border bg-background/85 p-3 backdrop-blur-md">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{tile.name}</p>
            {featured && (
              <p className="text-xs text-muted-foreground">{tile.category}</p>
            )}
          </div>
          <p className="shrink-0 text-sm font-bold tabular-nums text-link">
            {formatPrice(tile.price)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

export function HeroCollage() {
  const [main, ...rest] = heroTiles;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:h-[32rem] lg:grid-cols-5 lg:grid-rows-2">
      <Tile
        tile={main}
        index={0}
        featured
        className="col-span-2 aspect-[4/3] lg:col-span-3 lg:row-span-2 lg:aspect-auto"
      />
      {rest.map((tile, i) => (
        <Tile
          key={tile.id}
          tile={tile}
          index={i + 1}
          className="aspect-square lg:col-span-2 lg:aspect-auto"
        />
      ))}
    </div>
  );
}
