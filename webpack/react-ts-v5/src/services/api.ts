export default {
  common: {
    userTeams: '/api/account/team/list',
    developTeams: '/api/admin/develop/team/all',
    library: '/api/admin/component/library',
  },
  account: {
    auth: '/api/account/check',
    search: '/api/account/search',
    teams: '/api/account/team/list',
  },
  operating: {
    notice: {
      list: '/api/operating/notice/list',
    },
    classification: {
      list: '/api/operating/classification/list',
    },
    templateinfo: {
      getcaselist: '/api/operating/templateinfo/getcaselist',
    },
    daxue: {
      list: '/api/operating/daxue/list',
    },
    copy: {
      copy: '/api/operating/copy/copy',
    },
  },
  admin: {
    activity: {
      list: '/api/admin/activity/list',
      item: '/api/admin/activity/item',
    },
    information: {
      list: '/api/admin/information/list', //?start=0&length=100&status=true
    },
    component: {
      joinnew: {
        team: '/api/admin/component/joinnew/team',
      },
    },
  },
  service: {
    user: {
      home: '/api/service/user/home',
      config: {
        save: '/api/service/user/config/save',
      },
      version: {
        save: '/api/service/user/version/save',
      },
    },
  },
  // 活动
  activity: {
    create: '/api/admin/activity/create',
    delete: '/api/admin/activity/remove',
    status: '/api/admin/activity/status',
    edit: '/api/admin/activity/edit',
    list: '/api/admin/activity/list',
    filter: '/api/admin/activity/filter/list',
    log: '/api/admin/activity/log',
    copy: '/api/admin/activity/copy',
    version: '/api/service/tree/version/list',
    publish: '/api/admin/activity/publish',
    detail: '/topcube/api/tob/drawLottery/activity/detail',
    approver: '/api/admin/team/user/list',
    apply: '/api/permisson/applyPermission',
    teamConfig: 'api/admin/team/config/all',
  },
  // 母版
  template: {
    list: '/api/admin/template/list',
    create: '/api/admin/template/create',
    // delete: '/api/admin/activity/remove',
    edit: '/api/admin/template/edit',
    log: '/api/admin/template/log',
    copy: '/api/admin/template/copy',
    version: '/api/service/tree/version/list',
    approver: '/api/admin/team/user/list',
    apply: '/api/permisson/applyPermission',
  },
  permission: {
    getUsers: '/api/permisson/getUsers',
  },
  component: {
    search: '/api/admin/component/list/all',
    list: '/api/admin/component/list/online',
    // list: '/api/admin/component/library',
    teamList: '/api/admin/component/team',
    LXList: '/api/admin/component/bid/list',
    joinNewList: '/api/admin/component/joinnew/team',
  },
  componentType: {
    list: '/api/admin/component/category/all',
    edit: '/api/admin/component/category/edit',
    create: '/api/admin/component/category/create',
    delete: '/api/admin/component/category/remove',
  },
}
