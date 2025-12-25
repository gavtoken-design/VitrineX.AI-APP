import * as React from 'react';
import {
  RocketLaunchIcon,
  LightBulbIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  SparklesIcon,
  MagnifyingGlassCircleIcon,
  CameraIcon,
  ArchiveBoxIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  Bars3Icon,
  SunIcon,
  MoonIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  UserIcon,
  KeyIcon,
  ServerStackIcon,
  ArrowDownOnSquareIcon,
  PaintBrushIcon,
  UserCircleIcon,
  PlayIcon,
  StopCircleIcon,
  MicrophoneIcon,
  PaperAirplaneIcon,
  CloudArrowUpIcon,
  MusicalNoteIcon,
  CircleStackIcon,
  ClockIcon,
  PlusIcon,
  BoltIcon,
  ChartBarIcon,
  CodeBracketIcon,
  VideoCameraIcon,
  MapPinIcon,
  SpeakerWaveIcon,
  CalendarIcon,
  ViewColumnsIcon
} from '@heroicons/react/24/outline';

// Registro central de ícones. 
// Isso facilita a troca de bibliotecas de ícones no futuro ou a adição de SVGs personalizados.
export const iconRegistry = {
  // Navegação
  dashboard: RocketLaunchIcon,
  aiManager: LightBulbIcon,
  contentGen: DocumentTextIcon,
  adStudio: MegaphoneIcon,
  creativeStudio: CameraIcon,
  campaign: SparklesIcon,
  trends: MagnifyingGlassCircleIcon,
  library: ArchiveBoxIcon,
  calendar: CalendarDaysIcon,
  chat: ChatBubbleLeftRightIcon,
  settings: Cog6ToothIcon,

  // Interface / Ações Gerais
  menu: Bars3Icon,
  close: XMarkIcon,
  sun: SunIcon,
  moon: MoonIcon,
  globe: GlobeAltIcon,
  check: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
  trash: TrashIcon,
  download: ArrowDownTrayIcon,
  share: ShareIcon,
  user: UserIcon,
  key: KeyIcon,
  server: ServerStackIcon,
  export: ArrowDownOnSquareIcon,
  theme: PaintBrushIcon,
  profile: UserCircleIcon,
  play: PlayIcon,
  stop: StopCircleIcon,
  mic: MicrophoneIcon,
  send: PaperAirplaneIcon,
  cloudUp: CloudArrowUpIcon,
  music: MusicalNoteIcon,
  database: CircleStackIcon,
  clock: ClockIcon,
  plus: PlusIcon,
  bolt: BoltIcon,
  chart: ChartBarIcon,
  code: CodeBracketIcon,
  video: VideoCameraIcon,
  map: MapPinIcon,
  audio: SpeakerWaveIcon,
  calendarAlt: CalendarIcon,
  carousel: ViewColumnsIcon
};

export type IconName = keyof typeof iconRegistry;

interface IconProps extends React.ComponentProps<'svg'> {
  name: IconName;
  className?: string;
}

/**
 * Componente Global de Ícones.
 * Use este componente em vez de importar ícones diretamente do Heroicons.
 * Ex: <Icon name="dashboard" className="w-6 h-6" />
 */
const Icon: React.FC<IconProps> = ({ name, className = "w-6 h-6", ...props }) => {
  const IconComponent = iconRegistry[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in registry.`);
    return null;
  }

  return <IconComponent className={className} aria-hidden="true" {...props} />;
};

export default Icon;