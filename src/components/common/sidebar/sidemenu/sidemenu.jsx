
export const MENUITEMS = [
  {
    menutitle: 'MAIN',
    Items: [
      {
        icon: (<i className="side-menu__icon bx bx-home"></i>),
      type: 'link', // Change from 'sub' to 'link' since it has no children
      Name: '',
      active: false,
      selected: false,
      title: 'Dashboard',
      path: `${import.meta.env.BASE_URL}dashboard`, // Direct path to Dashboard
      badge: '',
      badgetxt: '1',
      class: 'badge bg-warning-transparent ms-2',
      }
    ]
  },
  {
    menutitle: "Main Navigation",
    Items: [
      {
        icon: (<i className="bx bx-file-blank side-menu__icon"></i>),
        type: "sub",
        Name: '',
        active: false,
        selected: false,
        title: "Agreement",
        badge: '',
        badgetxt: 'New',
        class: ' badge bg-secondary-transparent ms-2',
        children: [
          {
            path: `${import.meta.env.BASE_URL}newagreement`,
            title: "New Agreement",
            type: "link",
            active: false,
            selected: false,
          },
          {
            path: `${import.meta.env.BASE_URL}agreement/list`,
            title: "Agreement List",
            type: "link",
            active: false,
            selected: false,
          },
          // {
          //   path: `${import.meta.env.BASE_URL}pages/contactus`,
          //   title: "Verification",
          //   type: "link",
          //   active: false,
          //   selected: false,
          // },
          
        ],
      },
      {
        icon: (<i className="bx bx-task side-menu__icon"></i>),
        type: "sub",
        Name: '',
        active: false,
        selected: false,
        title: "Property",
        badge: '',
        badgetxt: 'New',
        class: 'badge bg-secondary-transparent ms-2',
        children: [
          {
            path: `${import.meta.env.BASE_URL}property/dashboard`,
            title: "Dashboard",
            type: "link",
            active: false,
            selected: false,
          },
          {
            path: `${import.meta.env.BASE_URL}property/listing`,
            title: "Listing",
            type: "link",
            active: false,
            selected: false,
          },
          {
            path: `${import.meta.env.BASE_URL}property/list`,
            title: "List",
            type: "link",
            active: false,
            selected: false,
          },
          {
            path: `${import.meta.env.BASE_URL}property/transaction`,
            title: "Transaction",
            type: "link",
            active: false,
            selected: false,
          },
        ],
      },
     
      {
        icon: (<i className="bx bx-task side-menu__icon"></i>),
        type: "sub",
        Name: '',
        active: false,
        selected: false,
        title: "Verification",
        badge: '',
        badgetxt: 'New',
        class: 'badge bg-secondary-transparent ms-2',
        children: [
          {
            path: `${import.meta.env.BASE_URL}verification/dashboard`,
            title: "Dashboard",
            type: "link",
            active: false,
            selected: false,
          },
          {
            path: `${import.meta.env.BASE_URL}verification/new`,
            title: "New",
            type: "link",
            active: false,
            selected: false,
          },
          {
            path: `${import.meta.env.BASE_URL}verification/list`,
            title: "List & Report",
            type: "link",
            active: false,
            selected: false,
          },

          {
            path: `${import.meta.env.BASE_URL}verification/payment-history`,
            title: "Payment History",
            type: "link",
            active: false,
            selected: false,
          },
        ],
      },
      {
        path: `${import.meta.env.BASE_URL}auth/signin`,
        icon: (<i className="bx bx-log-out side-menu__icon"></i>),
        type: "link",
        selected: false,
        active: false,
        title: "Log Out",
        
      },

    ],
  },
];
