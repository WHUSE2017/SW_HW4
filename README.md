# SW_HW4
## 目录
* [1. 引言](###1)
    * [1.1 编写目的](####1.1)
    * [1.2 项目简介]()
    * [1.3 参考资料]()
* [2. 总体描述]()
### 1. 引言
#### 1.1 编写目的
此需求规格说明书编制目的是明确本项目的详细需求，确认项目的功能和性能，和用户形成一致的理解和确认，作为进一步详细设计软件的基础。本文档仅供本项目全体成员，包括项目经理、设计人员、开发人员参考。
本项目作为高级软件工程的第四次课程，小组成员为王枫（031）、黄金筱（107）、周明浩（255）、刘烨（277），主要实现个人博客的搭建。初步决定使用python语言，flask框架。

#### 1.2 项目简介
- 项目名称： 未命名的博客（个人博客）
- 项目面向用户：个人博主
- 项目开发者：武汉大学软工实践 121ComeOn 小组

#### 1.3 参考资料
- flask 开发文档
- 《构建之法》(第二版)，邹欣。

### 2. 总体描述
  #### 2.1 项目背景
  通过前期调研，我们发现现代社会人们接触到的知识都是碎片化且散乱的知识，大家希望有一个可以把自己每天激发的想法、感受、学到的碎片知识或者想收藏供以后回顾的东西整理、记录下来，通过这种方式来记录生活，分享知识，交流经验。    
  而目前的博客网站不够个性化，相似的界面和复杂的操作促使我们希望设计开发出一个属于自己的博客，它符合我们的审美，有个性化功能，并且可以自主地添加自己其他功能，使每天的记录不再流于形式；开发此博客可以锻炼小组成员的代码能力，提高团队合作意识，从而完成一个更加自由、更加个性、更加专业的博客项目。
  #### 2.2 项目目标
  完成个人博客的基本功能，主要包括登录、搜索、发布博文、管理、讨论，以及根据需求分析添加的个性化功能，包括ToDoList、消息通知。对于游客来说，可以进行搜索、浏览、留言、分享等功能。
  
  #### 2.3 典型用户场景     
#####   我们的系统主要面向两类用户：      
  - 本系统的拥有者（博主）
  - 普通游客
 
  1. 博主小周

    |场景一|博主小周|
    ---|---
    姓名 | 小周
    性别|男
    职业|武汉大学研究生在读
    知识层次和能力|研究生，有一定计算机知识储备
    动机、目的、困难|动机、目的：记录碎片知识和心情，在项目中提高编程能力，搭建一个符合自己审美和功能的个性化专业博客
    用户偏好|扁平化设计风格，个性化功能
    用户比例|相当于占50%
    典型场景|登录博客，编辑博文选择相应的tag发布；在搜索框输入关键字搜索；修改或删除曾经的博文，也可修改博客风格以及相应功能；可以增加、删除、查看、修改代办事项和ToDoList分类，随时查看校内网通知。
    典型描述|我用我喜欢

  2.普通游客小李
    
     场景二|普通游客
     ---|---
     姓名|小李
     性别|男
     职业|学生
     知识层次和能力|大学，从小使用使用电脑
     动机、目的、困难|动机、目的：浏览网页，发现好玩的新鲜事，学习他人的知识。困难：网上无用的知识太多，不容易找到好资源
     用户偏好|有风格、有深度的干货
     用户比例|50%
     典型场景|这个博客真棒，我喜欢
    
  #### 2.4 典型用户需求说明
  1. 博主：能够添加博文、登录、搜索、管理博客、可以增加待办事项、可以接收消息、可以与留言进行互动
  2. 小李：能够搜索、浏览博客，与博主互动留言
 
  #### 2.5 运行环境要求
##### 1.服务器
##### 平台
依托于 Python 的开源，本项目可以在各种系统中（Windows、Linux、IOS、Android）运行。

##### 计算
采用 AJAX 技术，使用 JSON 格式进行缓存，所有的计算过程只在有数据更新时进行。
因此，有能力相信，在一个性能极低的路由器上亦可完美运行，且能提供不小的吞吐量，当然，存储器的大小需要根据实际的数据量确定。

##### 网络
通过 AJAX 技术，加之采用 GZIP 压缩传输数据，通信的数据量极其小，除去图片，用户每次的 page view 不足 5K。
假设用户的页面停留时间为3分钟，图片全部使用外部链接，那么 1M 带宽足够承载 5000 位用户同时访问。

##### 2.浏览器
通过使用 HTML5 提供的 API，以及 CSS3 提供的新样式，可支持所有现代浏览器

| 浏览器   | Chrome | Edge | Firefox | Internet Explorer | Opera | Safari |
| -------- | ------ | ---- | ------- | ----------------- | ----- | ------ |
| 最低版本 | 5      | All  | 4.0     | 10                | 11.50 | 5.0    |

### 3.前提与假设
##### 前提    
1. 技术前提：小组成员都熟悉python语言，有一定的编程经验。
2. 人员前提：小组主要成员基本不会出现变动，并且在项目开发过程中不会因为突发情况的发生而导致项目成员无法正常参与开发工作。
##### 假设
1. 可操作性：假定用户在经过一段时间熟悉之后，可以灵活地操作本网站来满足自己的需要。    
2. 用户支持：假定在本网站在开发的各个环节中得到用户的有效支持和配合。    
3. 时间限定：假定项目的截止时间不会提前。    
4. 需求限定：假定项目需求基本确定之后，不会有太大改变。

### 4.界面原型设计
HomePage页面
![HomePage页面](https://github.com/WHUSE2017/SW_HW4/blob/master/Images_Interface/homepage%E9%A1%B5%E9%9D%A2.png?raw=true)

Message页面
![Message页面](https://github.com/WHUSE2017/SW_HW4/blob/master/Images_Interface/Message%E9%A1%B5%E9%9D%A2.png?raw=true)

ToDoList页面
![ToDoList页面](https://github.com/WHUSE2017/SW_HW4/blob/master/Images_Interface/ToDoList%E9%A1%B5%E9%9D%A2.png?raw=true)

编辑ToDoList页面
![编辑ToDoList页面](https://github.com/WHUSE2017/SW_HW4/blob/master/Images_Interface/%E7%BC%96%E8%BE%91ToDo%E9%A1%B5%E9%9D%A2.png?raw=true)

登录页面
![登录页面](https://github.com/WHUSE2017/SW_HW4/blob/master/Images_Interface/%E7%99%BB%E5%BD%95%E9%A1%B5%E9%9D%A2.png?raw=true)

发布博文页面
![发布博文页面](https://github.com/WHUSE2017/SW_HW4/blob/master/Images_Interface/%E5%8F%91%E5%B8%83%E5%8D%9A%E6%96%87%E9%A1%B5%E9%9D%A2.png?raw=true)

设置页面
![设置页面](https://github.com/WHUSE2017/SW_HW4/blob/master/Images_Interface/%E8%AE%BE%E7%BD%AE%E9%A1%B5%E9%9D%A2.png?raw=true)

### 5.系统功能描述验收标准
#### 5.1对功能的规定
###### 首页功能
<table>
    <tr>
        <td><b>测试功能</b></td> 
        <td><b>测试项</b></td> 
        <td><b>输入/操作</b></td>
        <td><b>检验点</b></td>
        <td><b>测试功能</b></td>
        <td><b>完成情况</b></td>
   </tr>
    <tr>
        <td rowspan="12">首页功能</td>    
        <td rowspan="5">静态功能</td>
        <td></td>
        <td>导航栏按钮分布</td>
        <td>每个按钮可点击</td>
        <td></td>
    </tr>
    <tr>
        <td></td>
        <td>主页界面博客布局</td>
        <td>博客在主界面中呈缩略图垂直分布，并采用分页布局</td>
        <td></td> 
    </tr>
    <tr>
        <td></td>
        <td>搜索按钮</td>
        <td>点击可输入</td>
        <td></td> 
    </tr>
    <tr>
        <td></td>
        <td>主页界面博客布局</td>
        <td>博客在主界面中呈缩略图垂直分布，并采用分页布局</td>
        <td></td> 
    </tr>
    <tr>
        <td></td>
        <td>巨幕置顶</td>
        <td>博客名及欢迎语在博客最顶部显示，以巨幕形式始终置顶</td>
        <td></td> 
    </tr>
    <tr>
        <td rowspan="7">动态功能</td>
        <td rowspan="1">点击首页按钮</td>
        <td>确认功能、结果显示</td>
        <td>刷新主页</td>
        <td></td> 
    </tr>
    <tr>
        <td>点击发按钮布</td>
        <td>确认功能、结果显示</td>
        <td>未登录显示登录框，否则显示发布博客弹窗</td>
        <td></td>
    </tr>
    <tr>
        <td>点击ToDoList按钮</td>
        <td>确认功能、结果显示</td>
        <td>未登录显示登录框，否则显示事项弹窗</td>
        <td></td> 
    </tr>
    <tr>
        <td>点击消息按钮</td>
        <td>确认功能、结果显示</td>
        <td>未登录显示登录框，否则跳转至消息列表</td> 
        <td></td>
    </tr>
    <tr>
        <td>点击个人中心</td>
        <td>确认功能、结果显示</td>
        <td>未登录显示登录框，否则进入设置页面</td> 
        <td></td>
    </tr>
    <tr>
        <td>输入搜索内容</td>
        <td>搜索框</td>
        <td>显示搜索内容</td> 
        <td></td>
    </tr>
    <tr>
        <td>点击标签</td>
        <td>确认功能、结果显示</td>
        <td>显示对应标签博文</td> 
        <td></td>
    </tr>
</table>

###### 发布博客功能
<table>
    <tr>
        <td><b>测试功能</b></td> 
        <td><b>测试项</b></td> 
        <td><b>输入/操作</b></td>
        <td><b>检验点</b></td>
        <td><b>测试功能</b></td>
        <td><b>完成情况</b></td>
   </tr>
    <tr>
        <td rowspan="8">发布功能</td>    
    </tr>
    <tr>
        <td>静态布局</td>
        <td></td>
        <td>编辑页结构</td>
        <td>编辑页主要由以下六个部分组成：包括标题、时间、内容、分类、是否隐藏、是否切换编辑器</td>
        <td></td> 
    </tr>
    <tr>
        <td rowspan="7">输入测试</td>
        <td>输入框输入长度大小为10000的字符串</td>
        <td>确认功能、判断输入非法</td>
        <td>下方提示输入长度非法，重新输入</td>
        <td></td> 
    </tr>
    <tr>
        <td>不输入标题</td>
        <td>确认功能、判断输入非法</td>
        <td>将采用默认标题“标题”</td>
        <td></td>
    </tr>
    <tr>
        <td>不输入内容</td>
        <td>确认功能、判断输入非法</td>
        <td>下方提示内容不能为空</td>
        <td></td> 
    </tr>
    <tr>
        <td>不选取时间</td>
        <td>确认功能、判断输入非法</td>
        <td>下方提示时间不能为空</td>
        <td></td> 
    </tr>
    <tr>
        <td>点击编辑器复选框</td>
        <td>确认功能、结果显示</td>
        <td>切换为所选编辑器</td>
        <td></td> 
    </tr>
    <tr>
        <td>正确输入点击提交</td>
        <td>确认功能、判断结果</td>
        <td>增加新的博客并在主页顶端显示</td>
        <td></td> 
    </tr>
</table>

###### 博文页功能
<table border="0" cellpadding="0" cellspacing="0" id="sheet0" class="sheet0 gridlines">
		<col class="col0">
		<col class="col1">
		<col class="col2">
		<col class="col3">
		<col class="col4">
		<col class="col5">
		<tbody>
		  <tr class="row0">
			<td class="column0 style1 s">测试功能</td>
			<td class="column1 style1 s">测试项</td>
			<td class="column2 style1 s">输入/操作</td>
			<td class="column3 style1 s">检验点</td>
			<td class="column4 style1 s">测试功能</td>
			<td class="column5 style1 s">完成情况</td>
		  </tr>
		  <tr class="row1">
			<td class="column0 style2 s style2" rowspan="6">博文详情</td>
			<td class="column1 style3 s">静态页面</td>
			<td class="column2 style3 null"></td>
			<td class="column3 style3 s">页面布局</td>
			<td class="column4 style3 s">由上到下分为巨幕、导航、标题、内容、评论区这五个部分</td>
			<td class="column5 style3 null"></td>
		  </tr>
		  <tr class="row2">
			<td class="column1 style2 s style2" rowspan="5">动态功能</td>
			<td class="column2 style3 s">不输入邮箱</td>
			<td class="column3 style3 s">确认功能、判断非法操作</td>
			<td class="column4 style4 s">下方提示邮箱不能为空</td>
			<td class="column5 style3 null"></td>
		  </tr>
		  <tr class="row3">
			<td class="column2 style3 s">输入邮箱格式错误</td>
			<td class="column3 style3 s">确认功能、判断非法操作</td>
			<td class="column4 style4 s">下方提示邮箱格式错误</td>
			<td class="column5 style3 null"></td>
		  </tr>
		  <tr class="row4">
			<td class="column2 style3 s">不输入姓名</td>
			<td class="column3 style3 s">确认功能、判断非法操作</td>
			<td class="column4 style4 s">下方提示姓名不能为空</td>
			<td class="column5 style3 null"></td>
		  </tr>
		  <tr class="row5">
			<td class="column2 style3 s">不输入评论</td>
			<td class="column3 style3 s">确认功能、判断非法操作</td>
			<td class="column4 style4 s">下方提示评论不能为空</td>
			<td class="column5 style3 null"></td>
		  </tr>
		  <tr class="row6">
			<td class="column2 style3 s">点击提交按钮</td>
			<td class="column3 style3 s">确认功能、结果显示</td>
			<td class="column4 style5 s">评论内容显示在博文下面</td>
			<td class="column5 style3 null"></td>
		  </tr>
		</tbody>
	</table>
	
###### ToDoList页面
<table border="0" cellpadding="0" cellspacing="0" id="sheet0" class="sheet0 gridlines">
		<col class="col0">
		<col class="col1">
		<col class="col2">
		<col class="col3">
		<col class="col4">
		<col class="col5">
		<tbody>
		  <tr class="row0">
			<td class="column0 style3 s">测试功能</td>
			<td class="column1 style3 s">测试项</td>
			<td class="column2 style3 s">输入/操作</td>
			<td class="column3 style3 s">检验点</td>
			<td class="column4 style3 s">测试功能</td>
			<td class="column5 style3 s">完成情况</td>
		  </tr>
		  <tr class="row1">
			<td class="column0 style4 s style4" rowspan="4">待办事项</td>
			<td class="column1 style5 s">静态页面</td>
			<td class="column2">&nbsp;</td>
			<td class="column3 style6 s">页面布局</td>
			<td class="column4 style1 s">由上到下分为巨幕、导航、添加任务、代办任务列表、已完成任务列表这五个部分</td>
			<td class="column5">&nbsp;</td>
		  </tr>
		  <tr class="row2">
			<td class="column1 style4 s style4" rowspan="3">动态功能</td>
			<td class="column2 style6 s">输入新事务</td>
			<td class="column3 style6 s">确认功能、结果显示</td>
			<td class="column4 style2 s">将最新事务在列表最上端显示</td>
			<td class="column5">&nbsp;</td>
		  </tr>
		  <tr class="row3">
			<td class="column2 style6 s">点击事务前方框</td>
			<td class="column3 style6 s">确认功能、结果显示</td>
			<td class="column4 style2 s">事务被划掉，3秒后加入已完成列表</td>
			<td class="column5">&nbsp;</td>
		  </tr>
		  <tr class="row4">
			<td class="column2 style6 s">点击需要编辑的事务</td>
			<td class="column3 style6 s">确认功能、结果显示</td>
			<td class="column4 style2 s">显示编辑事务弹窗</td>
			<td class="column5">&nbsp;</td>
		  </tr>
		</tbody>
	</table>
	
###### 设置功能
<table border="0" cellpadding="0" cellspacing="0" id="sheet0" class="sheet0 gridlines">
		<col class="col0">
		<col class="col1">
		<col class="col2">
		<col class="col3">
		<col class="col4">
		<col class="col5">
		  <tr class="row0">
			<td class="column0 style1 s">测试功能</td>
			<td class="column1 style1 s">测试项</td>
			<td class="column2 style1 s">输入/操作</td>
			<td class="column3 style1 s">检验点</td>
			<td class="column4 style1 s">测试功能</td>
			<td class="column5 style1 s">完成情况</td>
		  </tr>
		  <tr class="row1">
			<td class="column0 style4 s style4" rowspan="4">设置功能</td>
			<td class="column1 style5 s">静态页面</td>
			<td class="column2 style5 null"></td>
			<td class="column3 style6 s">页面布局</td>
			<td class="column4 style2 s">由上到下分为巨幕、导航、更改巨幕图、修改tag分类、删除博文这五个部分</td>
			<td class="column5 style5 null"></td>
		  </tr>
		  <tr class="row2">
			<td class="column1 style4 s style4" rowspan="3">动态功能</td>
			<td class="column2 style6 s">点击上传按钮</td>
			<td class="column3 style6 s">确认功能、结果显示</td>
			<td class="column4 style3 s">上传图片</td>
			<td class="column5 style5 null"></td>
		  </tr>
		  <tr class="row3">
			<td class="column2 style6 s">编辑tag分类</td>
			<td class="column3 style6 s">确认功能、结果显示</td>
			<td class="column4 style3 s">页面显示编辑后的结果</td>
			<td class="column5 style5 null"></td>
		  </tr>
		  <tr class="row4">
			<td class="column2 style6 s">点击删除按钮</td>
			<td class="column3 style6 s">确认功能、结果显示</td>
			<td class="column4 style3 s">对应博文不显示在列表中</td>
			<td class="column5 style5 null"></td>
		  </tr>
	</table>
	
###### 消息页面
<table border="0" cellpadding="0" cellspacing="0" id="sheet0" class="sheet0 gridlines">
		<col class="col0">
		<col class="col1">
		<col class="col2">
		<col class="col3">
		<col class="col4">
		<col class="col5">
		<tbody>
		  <tr class="row0">
			<td class="column0 style1 s">测试功能</td>
			<td class="column1 style1 s">测试项</td>
			<td class="column2 style1 s">输入/操作</td>
			<td class="column3 style1 s">检验点</td>
			<td class="column4 style1 s">测试功能</td>
			<td class="column5 style1 s">完成情况</td>
		  </tr>
		  <tr class="row1">
			<td class="column0 style5 s style7" rowspan="2">消息页面</td>
			<td class="column1 style6 s">静态页面</td>
			<td class="column2 style6 null"></td>
			<td class="column3 style4 s">页面布局</td>
			<td class="column4 style2 s">由上到下分为巨幕、导航、消息列表这三个部分</td>
			<td class="column5 style6 null"></td>
		  </tr>
		  <tr class="row2">
			<td class="column1 style6 s">动态功能</td>
			<td class="column2 style4 s">点击每条消息</td>
			<td class="column3 style2 s">确认功能、结果显示</td>
			<td class="column4 style3 s">跳转至消息链接的页面</td>
			<td class="column5 style6 null"></td>
		  </tr>
		</tbody>
	</table>

