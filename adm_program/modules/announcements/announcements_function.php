<?php
/******************************************************************************
 * Verschiedene Funktionen fuer Ankuendigungen
 *
 * Copyright    : (c) 2004 - 2005 The Admidio Team
 * Homepage     : http://www.admidio.org
 * Module-Owner : Markus Fassbender
 *
 * Uebergaben:
 *
 * aa_id:    ID der Ankuendigung, die angezeigt werden soll
 * mode:     1 - Neue Ankuendigung anlegen
 *           2 - Ankuendigung l�schen
 *           3 - Ankuendigung �ndern
 * url:      kann beim Loeschen mit uebergeben werden
 * headline: Ueberschrift, die ueber den Ankuendigungen steht
 *           (Default) Ankuendigungen
 *
 ******************************************************************************
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 *
 *****************************************************************************/
require("../../../adm_config/config.php");
require("../../system/function.php");
require("../../system/string.php");
require("../../system/date.php");
require("../../system/session_check_login.php");

// erst pr�fen, ob der User auch die entsprechenden Rechte hat
if(!isModerator())
{
   $location = "location: $g_root_path/adm_program/system/err_msg.php?err_code=norights";
   header($location);
   exit();
}

if(!array_key_exists("headline", $_GET))
   $_GET["headline"] = "Ank�ndigungen";

$err_code = "";
$err_text = "";

if($_GET["mode"] == 1 || $_GET["mode"] == 3)
{
   $_POST['ueberschrift'] = trim($_POST['ueberschrift']);
   $_POST['datum']    = trim($_POST['datum']);

   if(strlen($_POST['ueberschrift']) > 0
   && strlen($_POST['datum'])    > 0 )
   {
      // wenn Datum gueltig, dann speichern

      if(dtCheckDate($_POST['datum']))
      {
         if(dtCheckTime($_POST['uhrzeit'])
         || $_POST['uhrzeit'] == "")
         {
            $dt_datum = dtFormatDate($_POST['datum'], "Y-m-d"). " ". dtFormatTime($_POST['uhrzeit']);

            $act_date = date("Y.m.d G:i:s", time());

            if(array_key_exists("global", $_POST))
               $global = 1;
            else
               $global = 0;

            // Termin speichern

            if ($_GET["aa_id"] == 0)
            {
               $sql = "INSERT INTO adm_ankuendigungen (aa_global, aa_ag_shortname, aa_au_id, aa_timestamp,
                                                        aa_ueberschrift, aa_datum, aa_beschreibung)
                                         VALUES ($global, '$g_organization', '$g_user_id', '$act_date',
                                                 {0}, '$dt_datum', {1})";
               $sql    = prepareSQL($sql, array($_POST['ueberschrift'], $_POST['beschreibung']));
               $result = mysql_query($sql, $g_adm_con);
               db_error($result);
            }
            else
            {
               $sql = "UPDATE adm_ankuendigungen SET aa_global         = $global
                                                    , aa_ueberschrift   = {0}
                                                    , aa_datum          = '$dt_datum'
                                                    , aa_beschreibung   = {1}
                                                    , aa_last_change    = '$act_date'
                                                    , aa_last_change_id = $g_user_id
                        WHERE aa_id = {2}";
               $sql    = prepareSQL($sql, array($_POST['ueberschrift'], $_POST['beschreibung'], $_GET['aa_id']));
               $result = mysql_query($sql, $g_adm_con);
               db_error($result);
            }

            $location = "location: $g_root_path/adm_program/modules/announcements/announcements.php?headline=". $_GET['headline'];
            header($location);
            exit();
         }
         else
         {
            $err_code = "uhrzeit";
         }
      }
      else
      {
         $err_code = "datum";
         $err_text = "Datum";
      }
   }
   else
   {
      $err_code = "felder";
   }
}
elseif($_GET["mode"] == 2)
{
   $sql = "DELETE FROM adm_ankuendigungen WHERE aa_id = {0}";
   $sql    = prepareSQL($sql, array($_GET["aa_id"]));
   $result = mysql_query($sql, $g_adm_con);
   db_error($result);

   if(!isset($_GET["url"]))
      $_GET["url"] = "$g_root_path/$g_main_page";

   $location = "location: $g_root_path/adm_program/system/err_msg.php?id=$id&err_code=delete&url=". urlencode($_GET["url"]);
   header($location);
   exit();
}

if ($err_code != "")
{
   $location = "location: $g_root_path/adm_program/system/err_msg.php?err_code=$err_code&err_text=$err_text";
   header($location);
   exit();
}
?>