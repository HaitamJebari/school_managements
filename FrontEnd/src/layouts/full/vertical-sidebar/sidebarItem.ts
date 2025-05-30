import { useI18n } from 'vue-i18n';
import {
    LayoutDashboardIcon,
    BriefcaseIcon,
    SchoolIcon,
    UsersIcon,
    HexagonsIcon,
    BuildingCarouselIcon,
    ChecklistIcon,
    SchoolOffIcon,
    BrandSteamIcon,
    NotesIcon,
    ReceiptRefundIcon,
    PresentationIcon,
    NotificationIcon,
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



// Function to generate the sidebar items dynamically using translations
const sidebarItem : menu[] = [
        {
            title: "Dashboard",
            icon: LayoutDashboardIcon,
            BgColor: 'primary',
            to: '/',
        },
        {
            title: "Teachers",
            icon: BriefcaseIcon,
            BgColor: 'primary',
            to: '/ui/teachers',
        },
        {
            title:"Students",
            icon: SchoolIcon,
            BgColor: 'primary',
            to: '/ui/students',
        },
    //       {
    //     title: 'Icons',
    //     BgColor: 'primary',
    //     to: '/icons'
    // },
        {
            title: "Classes",
            icon: UsersIcon,
            BgColor: 'primary',
            to: '/ui/classes',
        },
        {
            title: "Modules",
            icon: HexagonsIcon,
            BgColor: 'primary',
            to: '/ui/modules',
        },
        {
            title: "Groups",
            icon: BuildingCarouselIcon,
            BgColor: 'primary',
            to: '/ui/groups',
        },
        // {
        //     title: "Schedules",
        //     icon: ChecklistIcon,
        //     BgColor: 'primary',
        //     to: '/ui/schedules',
        // },
        {
            title: "Absences",
            icon: SchoolOffIcon,
            BgColor: 'primary',
            to: '/ui/absences',
        },
        {
            title: "Exams",
            icon: BrandSteamIcon,
            BgColor: 'primary',
            to: '/ui/exams',
        },
        // {
        //     title: "Grades",
        //     icon: NotesIcon,
        //     BgColor: 'primary',
        //     to: '/ui/grades',
        // },
        {
            title: "Financials",
            icon: ReceiptRefundIcon,
            BgColor: 'primary',
            to: '/ui/revenue',
        },
        // {
        //     title: "Results",
        //     icon: PresentationIcon,
        //     BgColor: 'primary',
        //     to: '/ui/results',
        // },
        {
            title: "Annoucements",
            icon: NotificationIcon,
            BgColor: 'primary',
            to: '/ui/ann',
        },
    ];


export default sidebarItem;

    // {
    //   title: "Button",
    //   icon: CircleDotIcon,
    //   BgColor: 'primary',
    //   to: "/ui/buttons",
    // },
    // {
    //   title: "Cards",
    //   icon: BoxMultiple1Icon,
    //   BgColor: 'primary',
    //   to: "/ui/cards",
    // },
    // {
    //   title: "Tables",
    //   icon: BorderAllIcon,
    //   BgColor: 'primary',
    //   to: "/ui/tables",
    // },

    // { header: 'Auth' },
    // {
    //     title: 'Login',
    //     icon: LoginIcon,
    //     BgColor: 'primary',
    //     to: '/auth/login'
    // },
    // {
    //     title: 'Register',
    //     icon: UserPlusIcon,
    //     BgColor: 'primary',
    //     to: '/auth/register'
    // },
    // // { header: 'Extra' },
    // {
    //     title: 'Icons',
    //     icon: MoodHappyIcon,
    //     BgColor: 'primary',
    //     to: '/icons'
    // },
    // {
    //     title: 'Sample Page',
    //     icon: ApertureIcon,
    //     BgColor: 'primary',
    //     to: '/sample-page'
    // },

// import {
//     LayoutDashboardIcon,BorderAllIcon,
//     AlertCircleIcon,
//     CircleDotIcon,
//     BoxMultiple1Icon,
//     LoginIcon, MoodHappyIcon, ApertureIcon, UserPlusIcon
//   } from 'vue-tabler-icons';
  
//   export interface menu {
//     header?: string;
//     title?: string;
//     icon?: any;
//     to?: string;
//     chip?: string;
//     BgColor?: string;
//     chipBgColor?: string;
//     chipColor?: string;
//     chipVariant?: string;
//     chipIcon?: string;
//     children?: menu[];
//     disabled?: boolean;
//     type?: string;
//     subCaption?: string;
//   }
  
//   const sidebarItem: menu[] = [
//     { header: 'Home' },
//     {
//       title: 'Dashboard',
//       icon: LayoutDashboardIcon,
//       BgColor: 'primary',
//       to: '/'
//     },
//     { header: 'Ui components' },
//     {
//       title: "Alert",
//       icon: AlertCircleIcon,
//       BgColor: 'primary',
//       to: "/ui/alerts",
      
//     },
//     {
//       title: "Button",
//       icon: CircleDotIcon,
//       BgColor: 'primary',
//       to: "/ui/buttons",
//     },
//     {
//       title: "Cards",
//       icon: BoxMultiple1Icon,
//       BgColor: 'primary',
//       to: "/ui/cards",
//     },
//     {
//       title: "Tables",
//       icon: BorderAllIcon,
//       BgColor: 'primary',
//       to: "/ui/tables",
//     },
  
//     { header: 'Auth' },
//     {
//       title: 'Login',
//       icon: LoginIcon,
//       BgColor: 'primary',
//       to: '/auth/login'
//   },
//   {
//       title: 'Register',
//       icon: UserPlusIcon,
//       BgColor: 'primary',
//       to: '/auth/register'
//   },
//   { header: 'Extra' },
//   {
//       title: 'Icons',
//       icon: MoodHappyIcon,
//       BgColor: 'primary',
//       to: '/icons'
//   },
//   {
//       title: 'Sample Page',
//       icon: ApertureIcon,
//       BgColor: 'primary',
//       to: '/sample-page'
//   },
  
//   ];
  
//   export default sidebarItem;
  

