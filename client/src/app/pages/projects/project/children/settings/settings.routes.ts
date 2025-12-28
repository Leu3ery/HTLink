import {General} from "./children/general/general";
import {ReadMe} from "./children/read-me/read-me";
import {Media} from "./children/media/media";
import {Links} from "./children/links/links";
import {Applications} from "./children/applications/applications";
import {Roles} from "./children/roles/roles";
import {Settings} from "./settings";

export default [
{
  path: "settings",
  children: [
    {
      path: "",
      component: Settings
    },
    {
      path: "media",
      component: Media,
    },
    {
      path: "general",
      component: General
    },
    {
      path: "readme",
      component: ReadMe,
    },
    {
      path: "links",
      component: Links
    },
    {
      path: "roles",
      component: Roles
    },
    {
      path: "applications",
      component: Applications
    },
    {
      path: '**',
      redirectTo: '',
    }
  ]
}
]
