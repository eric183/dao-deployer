/*!-----------------------------------------------------------
 * Copyright (c) dao42. All rights reserved.
 * Type definitions for @dao42/d42paas-front
 * Released under the MIT license
 *-----------------------------------------------------------*/

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export interface DiffPatternInfo {
  value: string;
  type: string;
}

export type ComponentType =
  | 'Page'
  | 'Tree'
  | 'Editor'
  | 'Console'
  | 'Browser'
  | 'Shell';

export type Mode = 'tsdoc' | 'singleFile' | 'IDE';

export type PlaygroundStatus = 'EMPTY' | 'ACTIVE' | 'INACTIVE';

export type DockerStatus = 'RUNNING' | 'STOP';

// export type Replay = 'stop' | 'disabled' | 'pause';
interface MessageType {
  /**
   * The message type is use to show up the playground status.
   */
  playgroundStatus?: PlaygroundStatus;

  /**
   * The message type is used to show up the docker status.
   */
  dockerStatus?: DockerStatus;

  /**
   * The message type is used to list the users in the room
   */
  userList?: UserInfo[];

  /**
   * The message type is used to identify the user you following.
   */
  followingUser?: UserInfo;

  /**
   * The message type is used to indicate the users who following you.
   */
  usersFollowYou?: UserInfo[];
}

interface ErrorType {
  /**
   * The error message block
   */
  message: {
    /**
     * The error message content
     */
    content: string;

    /**
     * The error playground you started
     */
    playgroundId: string;

    /**
     * The error timestamp
     */
    timestamp: number;
  };
}

/**
 * Userinfo type
 */
interface UserInfo {
  /**
   * The playground id show up in the user info
   */
  playgroundId?: string;

  operation?: any;
  uuid?: string;
  color?: string;
  name?: string;
  username?: string;
  userId?: string;
  role?: string;
  avatar?: string;
  onlineCount?: number;
}

// interface ReplayType {
//   /**
//    * The userId of the user who started the replay
//    */
//   userId?: UserInfo['userId'];

//   /**
//    * The timestamp of the replay
//    */
//   timestamp: number;
// }

export interface TreeProps {
  /**
   * The tree Item height
   */
  treeItemHeight?: string;
  /**
   * The background color of the tree
   */
  bgColor?: string;

  /**
   * The text color of the tree
   */
  fontColor?: string;

  /**
   * The drop background color
   */
  dropBgColor?: string;

  /**
   * The drop Text color
   */
  dropTextColor?: string;

  /**
   * The hover background color
   */
  hoverBgColor?: string;

  /**
   * The hover Text color
   */
  hoverTextColor?: string;

  /**
   * The tree item will fire the event when you click on it
   *
   * @param The path of the item
   * @param The uri of the item
   * @event
   */
  onClick?: (arg: { path: string; uri: string }) => void;
}

export interface MenuTagProps {
  /**
   * The style of the menu tag block
   */
  menuStyle?: {
    /**
     * The background color
     */
    backgroundColor?: string;

    /**
     * The text color
     */
    textColor?: string;

    /**
     * The hover background color
     */
    hoverBgColor?: string;

    /**
     * The hover text color
     */
    hoverTextColor?: string;

    /**
     * The icon color
     */
    iconColor?: string;

    /**
     * The icon hover color
     */
    hoverIconColor?: string;

    /**
     * The menu tag height
     */
    height?: string;
  };
}

interface EditorProps extends MenuTagProps {
  /**
   * The editor font size
   */
  fontSize: string;

  /**
   * The editor line height
   */
  lineHeight: string;

  /**
   *
   */

  /**
   * The Theme of the editor block
   */
  theme?: {
    /**
     * The color of the margin view overlay
     */
    marginViewOverlaysBgColor?: string;

    /**
     * The width of the margin view overlay
     */
    marginViewOverlaysWidth?: string;

    /**
     * The left position of the margin view overlay
     */
    marginViewOverlaysLeft?: string;

    /**
     * The line number color
     */
    lineNumbersColor?: string;

    /**
     * The line number with
     */
    lineNumbersWidth?: string;

    /**
     * The line number left
     */
    lineNumbersLeft?: string;

    /**
     * The active line number color
     */
    activeLineNumberColor?: string;
  };
}

export interface ConsoleOrShellProps {
  /**
   * The font size of the shell
   */
  fontSize?: number;

  /**
   * The font family of the shell
   */
  fontFamily?: string;

  /**
   * The line height of the shell
   */
  lineHeight?: number;

  /**
   * The cursor color of the shell
   */
  cursorBlink?: boolean;

  /**
   * The cursor width of the shell
   */
  cursorWidth?: number;

  /**
   * The cursor style of the shell
   */
  cursorStyle?: string;

  /**
   * if the shell can be right click to open the context menu
   */
  rightClickSelectsWord?: boolean;

  /**
   * The theme of the shell block
   */
  theme?: {
    /**
     * The background color
     */
    background?: string;
  };
}

export interface BrowserProps {
  /**
   * The url of the browser
   */
  url?: string;

  /**
   * if the browser can show the url
   */
  showURL?: boolean;

  /**
   * The fresh icon color
   */
  freshIconColor?: string;

  /**
   * The input text color
   */
  inputColor?: string;

  /**
   * The open icon color
   */
  openIconColor?: string;

  inputTextColor?: string;
  inputBgColor?: string;
  bgColor?: string;
  navBgColor?: string;
  navBorder?: string;
}

/**
 * The Component props type collection
 */
export type ComponentPropsType =
  | EditorProps
  | TreeProps
  | BrowserProps
  | ConsoleOrShellProps;

/**
 * Passing the values to init the playground.
 * @category PaaS Options [Required]
 */
export interface Options {
  /**
   * @ignore
   *
   */
  debug?: boolean;

  /**
   *
   * Error listener to the application.
   * @param The error message block
   * @event
   */
  onError?: (error: ErrorType) => void;

  /**
   *
   * Message listener to the application.
   * @param MessageType
   * @event
   */
  onMessage?: (message: MessageType) => void;

  /**
   * The service worker origin
   */
  // serviceWorkerOrigin?: string;

  /**
   *
   * init the playground with the mode.
   *
   */
  // mode?: Mode;

  /**
   *
   * init the playground with the paasDomain.
   *
   */
  // paasDomain: string;

  /**
   *
   * init the playground ticket needed.
   *
   */
  ticket: string;

  /**
   *
   * to init the playground with this id.
   *
   */
  playgroundId: string;

  /**
   *
   * userId for the playground.
   *
   */
  // userId: string;

  /**
   *
   * tenantId for the playground.
   *
   */
  tenantId: string;

  /**
   *
   * username for the playground.
   *
   */
  username?: string;

  /**
   *
   * avatarUrl for the playground but not necessarily.
   *
   */
  avatarUrl?: string;

  /**
   *
   * this argument is to ingnore replaying patterns.
   *
   */
  ignoreReplayers?: string[];

  /**
   *
   * Here you can map the components to the playground.
   *
   * @category ComponentsMapper
   *
   */
  components?: Component<ComponentPropsType>[];

  /**
   * @deprecated to fix the issue of the playground.
   *
   * render?: () => TComponent[]; keyof Dao_FrontType.CRDT[]
   */
}

/**
 *
 * @interface Component
 * @desc The props of the component.
 *
 */
export interface Component<T> {
  /**
   *
   * The DOM for the component.
   * @type {(string | HTMLElement | Element)}
   *
   */
  container: string | HTMLElement | Element;

  item: ComponentType;
  /**
   * The component props
   */
  props?: T;
}

/**
 * * This is the entry point for the application.
 *
 * * like:
 *
 *
 * ```ts
    let options = {...};
    let Dao = new DaoPaaS(options);
```
 *
 * See {@link Options} for more details.
 */
export class DaoPaaS {
  constructor(options: Options);

  get playgroundStatus(): PlaygroundStatus;

  get dockerStatus(): DockerStatus;

  get userList(): UserInfo[];

  /**
   *
   * Error listener to the application.
   * @param The error message block
   * @event
   */
  onError?: (error: ErrorType) => void;

  /**
   *
   * Message listener to the application.
   * @param MessageType
   * @event
   */
  onMessage?: (message: MessageType) => void;

  /**
   *
   * Replaying method for global calling.
   * @param {unFollowUser} args
   *
   */
  dispose(): Promise<string>;

  /**
   *
   * Replaying method for global calling.
   * @param {unFollowUser} args
   *
   */
  unFollowUser(user: UserInfo, callback: (userInfo: UserInfo) => void): void;

  /**
   *
   * Replaying method for global calling.
   * @param {followUser} args
   *
   */
  followUser(userId: string, callback: (userInfo: UserInfo) => void): void;

  /**
   *
   * Replaying method for global calling.
   * @param {DiffPatternInfo} args
   * @param {DiffPatternInfo} args
   *
   */
  setDiff(current: DiffPatternInfo, next: DiffPatternInfo): void;

  /**
   *
   * Replaying method for global calling.
   * @param {ReplayType} args
   *
   */
  replay(userId: Pick<UserInfo, 'userId'>): void;

  /**
   *
   * Recording method for global calling.
   * @param {boolean} arg
   *
   */
  record(arg?: boolean): void;

  /**
   *
   * async method to set Replayers.
   * @param {keyof Dao_FrontType.CRDT[]} arg
   *
   */
  setReplayers(arg: string[]): void;

  /**
   *
   * Here you can switch language services by calling this method.
   * @param {boolean} arg
   *
   */
  switchLspServer(arg: boolean): void;

  /**
   *
   * Active the playground handler.
   *
   */
  activePlayground(): void;

  /**
   *
   * Run the playground handler.
   *
   */
  runPlayground(): void;

  /**
   *
   * Stop the playground.
   *
   */
  stopPlayground(): void;

  /**
   * Editor component.
   *
   *
   * ```ts
   *   Dao.Editor({
   *     container: '#editor',
   *     props: {...EditorProps}
   *   });
  ```
   *
   * @category Components
   *
   *
   */
  Editor(args: Omit<Component<EditorProps>, 'item'>): void;

  /**
   *
   * Page component.
   * @ignore
   * @category Components
   * @param Component
   *
   */
  Page(args: Omit<Component<TreeProps>, 'item'>): void;

  /**
   *
   * Tree component.
   *
   * ```ts
   *   Dao.Tree({
   *     container: '#tree',
   *     item: 'tree',
   *     props: {...TreeProps}
   *   });
  ```
   *
   *
   * @category Components
   * @param Component
   *
   */
  Tree(args: Omit<Component<TreeProps>, 'item'>): void;

  /**
   *
   * Shell component.
   *
   *
   * ```ts
   *   Dao.Shell({
   *     container: '#shell',
   *     item: 'shell',
   *     props: {...ConsoleOrShellProps}
   *   });
  ```
   *
   *
   * @category Components
   * @param Component
   *
   */
  Shell(args: Omit<Component<ConsoleOrShellProps>, 'item'>): void;

  /**
   *
   * Browser component.
   *
   * ```ts
   *   Dao.Browser({
   *     container: '#browser',
   *     item: 'browser',
   *     props: {...BrowserProps}
   *   });
  ```
   *
   *
   * @category Components
   * @param Component
   *
   */
  Browser(args: Omit<Component<BrowserProps>, 'item'>): void;

  /**
   *
   * Console component.
   *
   *
   * ```ts
   *   Dao.Console({
   *     container: '#console',
   *     item: 'console',
   *     props: {...ConsoleOrShellProps}
   *   });
  ```
   *
   *
   * @category Components
   * @param Component
   *
   */
  Console(args: Omit<Component<ConsoleOrShellProps>, 'item'>): void;

  mapRender(components: Component<ComponentType>[]): void;
}
