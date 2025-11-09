import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from '@react-email/components'

interface LeadMagnetFreebieEmailProps {
  storeName: string
  storeProfilePic?: string
  customerName?: string
  freebieTitle: string
  freebieUrl: string
  freebieType: 'link' | 'file'
}

export default function LeadMagnetFreebieEmail({
  storeName = 'Our Store',
  storeProfilePic,
  customerName,
  freebieTitle = 'Your Freebie',
  freebieUrl = 'https://example.com',
  freebieType = 'link',
}: LeadMagnetFreebieEmailProps) {
  const previewText = `${customerName ? `Hi ${customerName}! ` : ''}Here's your freebie from ${storeName}`

  return (
    <Html>
      <Head />
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
        }}
      >
        <Body className="mx-auto my-auto bg-[#f6f9fc] px-2 font-sans">
          <Preview>{previewText}</Preview>
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-[#eaeaea] border-solid bg-white p-[20px]">
            {/* Store branding */}
            {storeProfilePic && (
              <Section className="mt-[32px]">
                <Img
                  src={storeProfilePic}
                  alt={storeName}
                  width="80"
                  height="80"
                  className="mx-auto my-0 rounded-full"
                />
              </Section>
            )}

            {/* Greeting */}
            <Heading className="mx-0 my-[30px] p-0 text-center font-bold text-[28px] text-black">
              {customerName ? `Hi ${customerName}!` : 'Hi there!'}
            </Heading>

            <Text className="text-[16px] text-black leading-[24px]">
              Thank you for your interest in <strong>{storeName}</strong>! As promised, here's your freebie:
            </Text>

            {/* Freebie title */}
            <Section className="my-[24px] rounded bg-[#f6f9fc] p-[20px]">
              <Text className="m-0 text-center font-semibold text-[20px] text-black">
                {freebieTitle}
              </Text>
            </Section>

            {/* CTA Button */}
            <Section className="my-[32px] text-center">
              <Button
                className="rounded bg-[#000000] px-8 py-4 text-center font-semibold text-[14px] text-white no-underline"
                href={freebieUrl}
              >
                {freebieType === 'file' ? '📥 Download Now' : '🔗 Access Now'}
              </Button>
            </Section>

            {/* Alternative link */}
            <Text className="text-[14px] text-black leading-[24px]">
              or copy and paste this URL into your browser:{' '}
              <Link href={freebieUrl} className="text-blue-600 no-underline break-all">
                {freebieUrl}
              </Link>
            </Text>

            <Hr className="mx-0 my-[26px] w-full border border-[#eaeaea] border-solid" />

            {/* Footer */}
            <Text className="text-[#666666] text-[12px] leading-[20px]">
              This email was sent by <span className="text-black">{storeName}</span>. If you have any questions, please reply to this email.
            </Text>

            {freebieType === 'file' && (
              <Text className="text-[#666666] text-[12px] leading-[20px] mt-[8px]">
                Note: Download links expire after 7 days for security reasons.
              </Text>
            )}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

// Preview props for testing
LeadMagnetFreebieEmail.PreviewProps = {
  storeName: 'Wau Store',
  customerName: 'John Doe',
  freebieTitle: 'Free E-Book: Complete Guide to Email Marketing',
  freebieUrl: 'https://example.com/download',
  freebieType: 'file',
} as LeadMagnetFreebieEmailProps
