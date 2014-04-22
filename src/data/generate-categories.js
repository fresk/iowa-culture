var _ = require('lodash');
var jf = require('jsonfile');

var names = {
    'Art Museums'                : 'art_museum',
    'Performing Arts Centers'    : 'art_performing',
    'Public Art'                 : 'art_public',
    'Barns'                      : 'barn',
    'Country Schools'            : 'country_school',
    'Historic Ballrooms'         : 'historic_ballrooms',
    'Historic Districts'         : 'historic_district',
    'Historic Hotels'            : 'historic_hotel',
    'History Museums'            : 'history_museum',
    'Historic Sites'             : 'historic_site',
    'Historic Marker'            : 'historic_marker',
    'State Historic Sites'       : 'state_historic_site',
    'Historic Theaters'          : 'theater',
    'National Historic Landmarks': 'national_historic_landmark',
    'National Register of Historic Places' : 'national_historic_register',
    'Notable Iowans'             : 'notable_iowan',
    'Iowa Governor Gravesites'   : 'gov_gravesite',
    'Uniquely Iowa'              : 'historic_unique',
    'Gardens and Nature Centers' : 'botany',
    'Science Centers'            : 'science',
    'Zoos and Wildlife'          : 'zoo',
    "Arts Commission or Council"         :  "arts_council",
    "Certified Local Government"         :  "local_government",
    "College or University"              :  "university",
    "Cultural/Entertainment District"    :  "cultural_district",
    "Famous Iowan Birthplace"            :  "famous_iowan",
    "Historical Society or Commission"   :  "historical_society",
    "Honored Iowan Birthplace"           :  "honored_iowan",
    "Iowa Award Recipient Birthplace"    :  "iowa_award",
    "Iowa Great Place"                   :  "iowa_great_place",
    "Local Landmark"                     :  "local_landmark",
    "Medal of Honor Recipient Birthplace":  "medal_of_honor",
    "Movie Theater"                      :  "movie",
    "Monuments and Memorials"            :  "monument_memorial",
    "Post Office Murals"                 :  "post_office_murals",
    "Scenic Byway"                       :  "scenic_byway",
    "Underground Railroad Site"          :  "underground_railroad"
};


var categories = {
  'displayNames' : _.invert(names),

    'art': [
      'art_museum',
      'art_performing',
      'art_public'
    ],
    'history': [
      'barn',
      'country_school',
      'historic_ballrooms',
      'historic_district',
      'historic_hotel',
      'history_museum',
      'historic_site',
      'historic_marker',
      'state_historic_site',
      'theater',
      'national_historic_landmark',
      'national_historic_register',
      'notable_iowan',
      'gov_gravesite',
      'historic_unique'
    ],
    'nature': [
      'botany',
      'science',
      'zoo'
    ]

}
var categoryNames = _.invert(categories);

jf.writeFileSync('categories.json', categories)








