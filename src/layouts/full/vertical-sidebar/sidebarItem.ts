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
    SchoolIcon
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
            title:"Students",
            icon: SchoolIcon,
            BgColor: 'primary',
            to: '/ui/students',
        },
];

export default sidebarItem;
