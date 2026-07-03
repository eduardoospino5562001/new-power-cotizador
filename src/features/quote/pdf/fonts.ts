import { Font } from '@react-pdf/renderer'
import interRegular from '@/assets/fonts/Inter-Regular.ttf'
import interSemiBold from '@/assets/fonts/Inter-SemiBold.ttf'
import interBold from '@/assets/fonts/Inter-Bold.ttf'

export function registerFonts() {
  Font.register({
    family: 'Inter',
    fonts: [
      { src: interRegular, fontWeight: 400 },
      { src: interSemiBold, fontWeight: 600 },
      { src: interBold, fontWeight: 700 },
    ],
  })
}
