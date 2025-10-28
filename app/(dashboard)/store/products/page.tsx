import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FileText,
  Gift,
  ArrowLeft,
  Link2Icon,
  InstagramIcon,
} from "lucide-react";
import { Typography } from "@/components/ui/typography";

const productTypes = [
  {
    id: 1,
    type: "Lead Magnet",
    description: "Free resources to capture leads and grow your audience",
    examples: ["E-books", "Checklists", "Templates", "Guides"],
    icon: Gift,
    href: "/store/products/lead-magnet",
  },
  {
    id: 2,
    type: "Links",
    description:
      "Link to a Website, Affiliate Link, or even Embed Youtube and Spotify content",
    examples: ["Website", "Affiliates", "Youtube", "Portfolio"],
    icon: Link2Icon,
    href: "/store/products/links",
  },
  {
    id: 3,
    type: "Digital Product",
    description: "Premium digital offerings and services",
    examples: ["Software", "Plugins", "Presets", "Assets"],
    icon: FileText,
    href: "/store/products/digital-product",
  },
];

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    designation: "Content Creator",
    company: "@sarahcreates",
    testimonial:
      "Selling my digital products has never been easier! The setup was quick and my audience loves how simple it is to purchase.",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    id: 2,
    name: "Mike Chen",
    designation: "Designer",
    company: "@mikedesigns",
    testimonial:
      "I've tripled my revenue by offering lead magnets and digital downloads. The platform makes it so seamless!",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
  },
];

const ProductsMenu = () => {
  return (
    <div className="max-w-(--breakpoint-xl) mx-auto py-6 lg:py-8 px-6 xl:px-6 flex flex-col lg:flex-row items-start gap-12">
      <div className="flex-1">
        <div className="mb-2">
          <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
            <Link href="/store" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Typography font="serif" variant="h2" className="tracking-tighter">
            Create a Product
          </Typography>
        </div>

        <div className="flex flex-col gap-2">
          {productTypes.map((productType) => {
            const Icon = productType.icon;
            return (
              <Link key={productType.id} href={productType.href}>
                <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-1 rounded-none hover:border-primary/50">
                  <CardContent className="px-4 py-2">
                    <div className="flex items-start gap-4 px-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Typography variant="h4" font="serif">
                            {productType.type}
                          </Typography>
                          <Badge variant="secondary" className="text-xs">
                            Popular
                          </Badge>
                        </div>
                        <Typography
                          variant="p"
                          font="sans"
                          className="text-muted-foreground text-xs mb-2"
                        >
                          {productType.description}
                        </Typography>
                        <div>
                          <div className="flex flex-wrap gap-2">
                            {productType.examples.map((example, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-3 py-1 bg-pink-100 border-1 border-pink-600 rounded-full text-pink-600"
                              >
                                {example}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
      <aside className="sticky top-8 shrink-0 lg:max-w-sm w-full">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Creator Stories</h3>
          <p className="text-sm text-muted-foreground">
            See how creators are succeeding
          </p>
        </div>
        <div className="space-y-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="text-lg font-medium bg-primary text-primary-foreground">
                      {testimonial.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.designation}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="#" target="_blank">
                    <InstagramIcon className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
              <p className="text-sm leading-relaxed">
                {testimonial.testimonial}
              </p>
            </Card>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default ProductsMenu;
