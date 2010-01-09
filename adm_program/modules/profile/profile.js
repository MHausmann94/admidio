/******************************************************************************
 * Profil Javascript Funktionen
 *
 * Copyright    : (c) 2004 - 2009 The Admidio Team
 * Homepage     : http://www.admidio.org
 * Module-Owner : Markus Fassbender
 * License      : GNU Public License 2 http://www.gnu.org/licenses/gpl-2.0.html
 *
 *****************************************************************************/

function profileJSClass()
{
	this.formerRoleCount 			= 0;
	this.usr_id 					= 0;
	this.deleteRole_ConfirmText		= "";
	this.deleteRole_ErrorText		= "";
	this.deleteFRole_ConfirmText 	= "";
	this.deleteFRole_ErrorText 		= "";
	this.changeRoleDates_ErrorText	= "";
	this.setBy_Text					= "";
	this.errorID					= 0;
	
	this.reloadRoleMemberships = function()
	{
		$.ajax({
			type: "GET",
			url: gRootPath + "/adm_program/modules/profile/roles_ajax.php?action=0&user_id=" + this.usr_id,
			dataType: "html",
			success: function(responseText, statusText){
				$("#profile_roles_box_body").html(responseText);
			}
		});
	}
	this.reloadFormerRoleMemberships = function()
	{
		$.ajax({
			type: "GET",
			url: gRootPath + "/adm_program/modules/profile/roles_ajax.php?action=1&user_id=" + this.usr_id,
			dataType: "html",
			success: function(responseText, statusText){
				$("#profile_former_roles_box_body").html(responseText);
			}
		});
	}
	
	this.deleteRole = function(rol_id, rol_name)
	{
		var msg_result = confirm(this.deleteRole_ConfirmText.replace(/\[rol_name\]/gi,rol_name));
		if(msg_result)
		{
			// Listenelement mit Unterelemten einfuegen
			$('#profile_former_roles_box').fadeIn('slow');
	
			$.ajax({
				type: "POST",
				url: gRootPath + "/adm_program/modules/profile/profile_function.php",
				data: "mode=2&user_id=" + this.usr_id + "&rol_id=" + rol_id,
				dataType: "html",
				success: function(responseText, statusText){
					$("#role_" + rol_id).fadeOut("slow");
					if(profileJS)
					{
						profileJS.formerRoleCount++;
						profileJS.reloadFormerRoleMemberships();
					}
				},
				error: function (xhr, ajaxOptions, thrownError){
					alert(this.deleteRole_ErrorText);
				}
			});
		}
	}
	
	this.deleteFormerRole = function(rol_id, rol_name) 
	{
		var msg_result = confirm(this.deleteFRole_ConfirmText.replace(/\[rol_name\]/gi,rol_name));
		if(msg_result)
		{
			$.ajax({
				type: "POST",
				url: gRootPath + "/adm_program/modules/profile/profile_function.php",
				data: "mode=3&user_id=" + this.usr_id + "&rol_id=" + rol_id,
				dataType: "html",
				success: function(responseText, statusText){
					$("#former_role_" + rol_id).fadeOut("slow");
					if(profileJS)
					{
						profileJS.formerRoleCount--;
						if(profileJS.formerRoleCount == 0)
						{
							$("#profile_former_roles_box").fadeOut("slow");
						}
					}
				},
				error: function (xhr, ajaxOptions, thrownError){
					alert(this.deleteFRole_ErrorText);
				}
			});
		}
	}
	this.markLeader = function(element)
	{
		if(element.checked == true)
		{
			var name   = element.name;
			var pos_number = name.search("-") + 1;
			var number = name.substr(pos_number, name.length - pos_number);
			var role_name = "role-" + number;
			$("#" + role_name).attr("checked",true);
		}
	}

	this.unmarkLeader = function(element)
	{
		if(element.checked == false)
		{
			var name   = element.name;
			var pos_number = name.search("-") + 1;
			var number = name.substr(pos_number, name.length - pos_number);
			var role_name = "leader-" + number;
			$("#" + role_name).attr("checked",false);
		}
	}
	this.showInfo = function(name)
	{
		$("#anzeige:first-child").text(this.setBy_Text + ": " + name);
	}
	this.deleteShowInfo = function()
	{
		$("#anzeige:first-child").text(this.setBy_Text + ": ");
	}
	this.toggleDetailsOn = function(role_id)
	{
		$("#mem_rol_" + role_id).css({"visibility":"visible","display":"block"});
	}
	this.toggleDetailsOff = function(role_id)
	{
		$("#mem_rol_" + role_id).css({"visibility":"hidden","display":"none"});
	}
	this.changeRoleDates = function(role,role_id)
	{
		$.ajax({
				type: "GET",
				url: gRootPath + "/adm_program/modules/profile/roles_ajax.php?action=2&usr_id="+this.usr_id+"&mode=1&rol_id="+role_id+"&rol_begin="+document.getElementById("begin"+role).value+"&rol_end="+document.getElementById("end"+role).value,
				dataType: "html",
				success: function(responseText, statusText){
					if(responseText.match(/<SAVED\/>/gi))
					{
						responseText = responseText.replace(/<SAVED\/>/gi,"");
						$("#mem_rol_" + role_id).text(responseText);
						setTimeout('$("#mem_rol_" + role_id).fadeOut("slow")',500);
						setTimeout('profileJS.reloadRoleMemberships();',500);
						setTimeout('profileJS.reloadFormerRoleMemberships();',500);
					}
					else
					{
						profileJS.errorID++;
						$("#mem_rol_" + role_id).append('<div id="errorAccured'+profileJS.errorID+'" style="border:1px solid red; padding:5px; margin:2px 0px 2px 0px; text-align:left;">'+ responseText +'</div>');
						setTimeout('$("#errorAccured'+profileJS.errorID+'").fadeOut("slow")',4250);
					}
				},
				error: function (xhr, ajaxOptions, thrownError){
					alert(this.changeRoleDates_ErrorText);
				}
			});
	}
}