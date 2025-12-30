export interface SavingGroupData {
  groupName: string
  description: string
  amount: number
  currency: string
  frequency: string
  duration: string
  members: string[]
}

export interface ScreenProps {
  onNavigate: (screen: string, data?: SavingGroupData) => void
}

export interface ScreenPropsWithData extends ScreenProps {
  data: SavingGroupData
}
