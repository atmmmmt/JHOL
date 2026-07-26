import image1 from '../assets/images/1.webp'
import image2 from '../assets/images/2.webp'
import image3 from '../assets/images/3.webp'
import image4 from '../assets/images/4.webp'
import image5 from '../assets/images/5.webp'
import image6 from '../assets/images/6.webp'
import image7 from '../assets/images/7.webp'
import logo from '../assets/images/Jhoragency-logo.png.webp'

export type SlideItem = {
  id: number
  image: string
  alt: string
  brand: string
  subtitle: string
  logo?: string
}

export const landingSlides: SlideItem[] = [
  {
    id: 1,
    image: image1.src,
    alt: 'Safety brand visual in orange',
    brand: 'Safety Brand',
    subtitle: 'Brand identity and campaign',
    logo: logo.src,
  },
  {
    id: 2,
    image: image2.src,
    alt: 'Luxury real estate brand visual in green',
    brand: 'HLR',
    subtitle: 'Home luxury realestate',
    logo: logo.src,
  },
  {
    id: 3,
    image: image3.src,
    alt: 'Jsr Miemar bridge visual in red',
    brand: 'Jsr Miemar',
    subtitle: 'We build to the summit',
    logo: logo.src,
  },
]

export const gallerySlides: SlideItem[] = [
  {
    id: 4,
    image: image4.src,
    alt: 'Brand stand posters',
    brand: 'Jsr Miemar',
    subtitle: 'Outdoor stand campaign',
    logo: logo.src,
  },
  {
    id: 5,
    image: image5.src,
    alt: 'Safety equipment art direction',
    brand: 'Safety Brand',
    subtitle: 'Product visualization',
    logo: logo.src,
  },
  {
    id: 6,
    image: image6.src,
    alt: 'Branded work vest',
    brand: 'Jsr Miemar',
    subtitle: 'Uniform and apparel',
    logo: logo.src,
  },
  {
    id: 7,
    image: image7.src,
    alt: 'Promotional sign collection',
    brand: 'Safety Brand',
    subtitle: 'Retail communication',
    logo: logo.src,
  },
]
