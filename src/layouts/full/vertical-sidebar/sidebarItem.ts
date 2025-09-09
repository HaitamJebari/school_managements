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
        title: 'Teachers',
        icon: BriefcaseIcon,
        BgColor: 'primary',
        to: '/teachers'
    },
    {
        title: 'Students',
        icon: SchoolIcon,
        BgColor: 'primary',
        to: '/students'
    },
    {
        title: 'Classes',
        icon: UsersIcon,
        BgColor: 'primary',
        to: '/classes'
    },
    {
        title: 'Modules',
        icon: HexagonsIcon,
        BgColor: 'primary',
        to: '/modules'
    },
    {
        title: 'Groups',
        icon: BuildingCarouselIcon,
        BgColor: 'primary',
        to: '/groups'
    },

    {
        title: 'Absences',
        icon: SchoolOffIcon,
        BgColor: 'primary',
        to: '/absences'
    },
    {
        title: 'Exams',
        icon: BrandSteamIcon,
        BgColor: 'primary',
        to: '/exams'
    },

    {
        title: 'Financials',
        icon: ReceiptRefundIcon,
        BgColor: 'primary',
        to: '/financials'
    },

    {
        title: 'Annoucements',
        icon: NotificationIcon,
        BgColor: 'primary',
        to: '/ann'
    }
];

export default sidebarItem;
