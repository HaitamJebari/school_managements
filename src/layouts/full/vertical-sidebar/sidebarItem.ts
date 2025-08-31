import {
    LayoutDashboardIcon,
    BorderAllIcon,
    AlertCircleIcon,
    CircleDotIcon,
    BoxMultiple1Icon,
    LoginIcon,
    MoodHappyIcon,
    ApertureIcon,
    UserPlusIcon,
    BriefcaseIcon,
    SchoolIcon,
    UsersIcon,
    HexagonsIcon,
    BuildingCarouselIcon,
    SchoolOffIcon,
    BrandSteamIcon,
    ReceiptRefundIcon,
    NotificationIcon
} from 'vue-tabler-icons';

export interface menu {
    header?: string;
    title?: string;
    icon?: any;
    to?: string;
    chip?: string;
    BgColor?: string;
    chipBgColor?: string;
    chipColor?: string;
    chipVariant?: string;
    chipIcon?: string;
    children?: menu[];
    disabled?: boolean;
    type?: string;
    subCaption?: string;
}

const sidebarItem: menu[] = [
    {
        title: 'Dashboard',
        icon: LayoutDashboardIcon,
        BgColor: 'primary',
        to: '/'
    },
    //   { header: 'Ui components' },
    {
        title: 'Alert',
        icon: AlertCircleIcon,
        BgColor: 'primary',
        to: '/ui/alerts'
    },
    {
        title: 'Teachers',
        icon: BriefcaseIcon,
        BgColor: 'primary',
        to: '/ui/teachers'
    },
    {
        title: 'Students',
        icon: SchoolIcon,
        BgColor: 'primary',
        to: '/ui/students'
    },
    {
        title: 'Classes',
        icon: UsersIcon,
        BgColor: 'primary',
        to: '/ui/classes'
    },
    {
        title: 'Modules',
        icon: HexagonsIcon,
        BgColor: 'primary',
        to: '/ui/modules'
    },
    {
        title: 'Groups',
        icon: BuildingCarouselIcon,
        BgColor: 'primary',
        to: '/ui/groups'
    },

    {
        title: 'Absences',
        icon: SchoolOffIcon,
        BgColor: 'primary',
        to: '/ui/absences'
    },
    {
        title: 'Exams',
        icon: BrandSteamIcon,
        BgColor: 'primary',
        to: '/ui/exams'
    },

    {
        title: 'Financials',
        icon: ReceiptRefundIcon,
        BgColor: 'primary',
        to: '/ui/financials'
    },

    {
        title: 'Annoucements',
        icon: NotificationIcon,
        BgColor: 'primary',
        to: '/ui/ann'
    }
];

export default sidebarItem;
