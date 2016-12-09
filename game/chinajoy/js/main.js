document.write("<script src=\"js/ZGCore.js\"></script>");
document.write("<script src=\"js/action.js\"></script>");
document.write("<script src=\"js/res.js\"></script>");
document.write("<script src=\"js/ui.js\"></script>");
document.write("<script src=\"js/viewBase.js\"></script>");
document.write("<script src=\"level/level_4/level.js\"></script>");

document.write("<script src=\"js/zhGame.js\"></script>");


var game=null;
function start(){

	game=new ZhGame({width:750,height:1334,levelName:'level_4',gid:6,weixin:true});
}

