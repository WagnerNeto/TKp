import { Ionicons, MaterialIcons, EvilIcons } from "@expo/vector-icons";

export const icons = {
    Início: (props)=> <MaterialIcons name="home" size={26} {...props} />,
    Histórico: (props)=> <Ionicons name="time-outline" size={26} {...props} />,
    Perfil: (props)=> <EvilIcons name="user" size={26} {...props} />,
}